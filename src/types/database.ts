// Database types for Supabase
// These match the schema in supabase/migrations/001_initial_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          school: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          school?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          school?: string | null;
          updated_at?: string;
        };
      };
      iep_cases: {
        Row: {
          id: string;
          teacher_id: string;
          status: 'intake' | 'in_progress' | 'review' | 'complete';
          student_name: string;
          student_dob: string;
          student_id: string | null;
          school_name: string;
          grade_level: string;
          parent_name: string;
          parent_email: string | null;
          student_address: string | null;
          student_intake_token: string;
          parent_intake_token: string;
          previous_iep_path: string | null;
          testing_data_path: string | null;
          document_analysis: string | null;
          plep: string | null;
          goals: Goal[];
          supplemental_services: SupplementalService[];
          pwn: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          status?: 'intake' | 'in_progress' | 'review' | 'complete';
          student_name: string;
          student_dob: string;
          student_id?: string | null;
          school_name: string;
          grade_level: string;
          parent_name: string;
          parent_email?: string | null;
          student_address?: string | null;
          student_intake_token?: string;
          parent_intake_token?: string;
          previous_iep_path?: string | null;
          testing_data_path?: string | null;
          document_analysis?: string | null;
          plep?: string | null;
          goals?: Goal[];
          supplemental_services?: SupplementalService[];
          pwn?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'intake' | 'in_progress' | 'review' | 'complete';
          student_name?: string;
          student_dob?: string;
          student_id?: string | null;
          school_name?: string;
          grade_level?: string;
          parent_name?: string;
          parent_email?: string | null;
          student_address?: string | null;
          previous_iep_path?: string | null;
          testing_data_path?: string | null;
          document_analysis?: string | null;
          plep?: string | null;
          goals?: Goal[];
          supplemental_services?: SupplementalService[];
          pwn?: string | null;
          updated_at?: string;
        };
      };
      riasec_responses: {
        Row: {
          id: string;
          case_id: string;
          realistic: number;
          investigative: number;
          artistic: number;
          social: number;
          enterprising: number;
          conventional: number;
          raw_responses: Json | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          realistic?: number;
          investigative?: number;
          artistic?: number;
          social?: number;
          enterprising?: number;
          conventional?: number;
          raw_responses?: Json | null;
          completed_at?: string;
        };
        Update: {
          realistic?: number;
          investigative?: number;
          artistic?: number;
          social?: number;
          enterprising?: number;
          conventional?: number;
          raw_responses?: Json | null;
          completed_at?: string;
        };
      };
      interview_responses: {
        Row: {
          id: string;
          case_id: string;
          interview_type: 'student' | 'parent';
          responses: InterviewQA[];
          completed_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          interview_type: 'student' | 'parent';
          responses?: InterviewQA[];
          completed_at?: string;
        };
        Update: {
          interview_type?: 'student' | 'parent';
          responses?: InterviewQA[];
          completed_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          teacher_id: string | null;
          case_id: string | null;
          action: string;
          details: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id?: string | null;
          case_id?: string | null;
          action: string;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: never; // Audit logs should never be updated
      };
    };
  };
}

// Helper types for JSONB columns
export interface Goal {
  id: string;
  area: string;
  annualGoal: string;
  baseline: string;
  measurementMethod: string;
  shortTermObjectives: ShortTermObjective[];
}

export interface ShortTermObjective {
  id: string;
  description: string;
  criteria: string;
  targetDate: string;
}

export interface SupplementalService {
  service: string;
  frequency: string;
  duration: string;
  location: string;
  provider: string;
}

export interface InterviewQA {
  question: string;
  answer: string;
}

// Convenience type aliases
export type Teacher = Database['public']['Tables']['teachers']['Row'];
export type IEPCase = Database['public']['Tables']['iep_cases']['Row'];
export type RIASECResponse = Database['public']['Tables']['riasec_responses']['Row'];
export type InterviewResponse = Database['public']['Tables']['interview_responses']['Row'];
export type AuditLogEntry = Database['public']['Tables']['audit_log']['Row'];

// Insert types
export type NewIEPCase = Database['public']['Tables']['iep_cases']['Insert'];
export type UpdateIEPCase = Database['public']['Tables']['iep_cases']['Update'];
