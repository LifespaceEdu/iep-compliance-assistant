-- IEP Compliance Assistant Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teachers table (extends Supabase auth.users)
CREATE TABLE teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  school TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IEP Cases
CREATE TABLE iep_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'intake' CHECK (status IN ('intake', 'in_progress', 'review', 'complete')),

  -- Student info (PII - stored encrypted at rest by Supabase)
  student_name TEXT NOT NULL,
  student_dob DATE NOT NULL,
  student_id TEXT,
  school_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT,
  student_address TEXT,

  -- Intake tokens (for sending forms to student/parent)
  student_intake_token UUID DEFAULT uuid_generate_v4(),
  parent_intake_token UUID DEFAULT uuid_generate_v4(),

  -- Document references (stored in Supabase Storage)
  previous_iep_path TEXT,
  testing_data_path TEXT,

  -- Generated content (stored with PII placeholders)
  document_analysis TEXT,
  plep TEXT,
  goals JSONB DEFAULT '[]'::jsonb,
  supplemental_services JSONB DEFAULT '[]'::jsonb,
  pwn TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RIASEC Assessment Responses
CREATE TABLE riasec_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES iep_cases(id) ON DELETE CASCADE,

  -- Scores (0-100 scale)
  realistic INTEGER NOT NULL DEFAULT 0,
  investigative INTEGER NOT NULL DEFAULT 0,
  artistic INTEGER NOT NULL DEFAULT 0,
  social INTEGER NOT NULL DEFAULT 0,
  enterprising INTEGER NOT NULL DEFAULT 0,
  conventional INTEGER NOT NULL DEFAULT 0,

  -- Raw responses stored as JSON
  raw_responses JSONB,

  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview Responses (student or parent)
CREATE TABLE interview_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES iep_cases(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('student', 'parent')),

  -- Q&A pairs stored as JSON array
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,

  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for FERPA compliance
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  case_id UUID REFERENCES iep_cases(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE iep_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE riasec_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Teachers can only see their own profile
CREATE POLICY "Teachers can view own profile"
  ON teachers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Teachers can update own profile"
  ON teachers FOR UPDATE
  USING (auth.uid() = id);

-- Teachers can only see their own cases
CREATE POLICY "Teachers can view own cases"
  ON iep_cases FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert own cases"
  ON iep_cases FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own cases"
  ON iep_cases FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own cases"
  ON iep_cases FOR DELETE
  USING (teacher_id = auth.uid());

-- RIASEC responses - teachers see their cases' responses
CREATE POLICY "Teachers can view case riasec"
  ON riasec_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM iep_cases
      WHERE iep_cases.id = riasec_responses.case_id
      AND iep_cases.teacher_id = auth.uid()
    )
  );

-- Allow anonymous insert for intake forms (via token validation in app)
CREATE POLICY "Anyone can insert riasec via token"
  ON riasec_responses FOR INSERT
  WITH CHECK (true);

-- Interview responses - same pattern
CREATE POLICY "Teachers can view case interviews"
  ON interview_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM iep_cases
      WHERE iep_cases.id = interview_responses.case_id
      AND iep_cases.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert interview via token"
  ON interview_responses FOR INSERT
  WITH CHECK (true);

-- Audit log - teachers can only see their own actions
CREATE POLICY "Teachers can view own audit log"
  ON audit_log FOR SELECT
  USING (teacher_id = auth.uid());

-- System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- Function to automatically create teacher profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teachers (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create teacher profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_iep_cases_updated_at
  BEFORE UPDATE ON iep_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX idx_iep_cases_teacher_id ON iep_cases(teacher_id);
CREATE INDEX idx_iep_cases_status ON iep_cases(status);
CREATE INDEX idx_iep_cases_student_intake_token ON iep_cases(student_intake_token);
CREATE INDEX idx_iep_cases_parent_intake_token ON iep_cases(parent_intake_token);
CREATE INDEX idx_riasec_case_id ON riasec_responses(case_id);
CREATE INDEX idx_interview_case_id ON interview_responses(case_id);
CREATE INDEX idx_audit_log_teacher_id ON audit_log(teacher_id);
CREATE INDEX idx_audit_log_case_id ON audit_log(case_id);
