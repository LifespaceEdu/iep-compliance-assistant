'use client';

import { useState } from 'react';
import { StudentInfo } from '@/types/iep';

interface StudentInfoStepProps {
  studentInfo?: StudentInfo;
  onUpdate: (info: StudentInfo) => void;
  onNext: () => void;
}

export function StudentInfoStep({
  studentInfo,
  onUpdate,
  onNext,
}: StudentInfoStepProps) {
  const [info, setInfo] = useState<StudentInfo>(
    studentInfo || {
      name: '',
      dateOfBirth: '',
      studentId: '',
      school: '',
      grade: '',
      parentName: '',
      parentEmail: '',
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof StudentInfo, string>>>({});

  const handleChange = (field: keyof StudentInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StudentInfo, string>> = {};

    if (!info.name.trim()) {
      newErrors.name = 'Student name is required';
    }
    if (!info.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!info.school.trim()) {
      newErrors.school = 'School name is required';
    }
    if (!info.grade.trim()) {
      newErrors.grade = 'Grade level is required';
    }
    if (!info.parentName.trim()) {
      newErrors.parentName = 'Parent/guardian name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onUpdate(info);
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Information</h2>
      <p className="text-gray-600 mb-6">
        Enter the student&apos;s identifying information. This data is used for PII masking
        and will be stored securely. The AI will never see these real values.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <svg
            className="h-5 w-5 text-blue-400 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Privacy Protection</h3>
            <p className="text-sm text-blue-700 mt-1">
              This information is replaced with placeholders like [STUDENT_NAME] before
              any AI processing. Real names are only restored in the final documents.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Student Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={info.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., John Smith"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date of Birth *
            </label>
            <input
              type="date"
              id="dob"
              value={info.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="studentId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Student ID
            </label>
            <input
              type="text"
              id="studentId"
              value={info.studentId}
              onChange={(e) => handleChange('studentId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 12345678"
            />
          </div>

          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Grade Level *
            </label>
            <select
              id="grade"
              value={info.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.grade ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select grade...</option>
              <option value="Pre-K">Pre-K</option>
              <option value="Kindergarten">Kindergarten</option>
              <option value="1st Grade">1st Grade</option>
              <option value="2nd Grade">2nd Grade</option>
              <option value="3rd Grade">3rd Grade</option>
              <option value="4th Grade">4th Grade</option>
              <option value="5th Grade">5th Grade</option>
              <option value="6th Grade">6th Grade</option>
              <option value="7th Grade">7th Grade</option>
              <option value="8th Grade">8th Grade</option>
              <option value="9th Grade">9th Grade</option>
              <option value="10th Grade">10th Grade</option>
              <option value="11th Grade">11th Grade</option>
              <option value="12th Grade">12th Grade</option>
              <option value="Transition">Transition (18-22)</option>
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="school"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              School Name *
            </label>
            <input
              type="text"
              id="school"
              value={info.school}
              onChange={(e) => handleChange('school', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.school ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Waipahu Elementary School"
            />
            {errors.school && (
              <p className="mt-1 text-sm text-red-600">{errors.school}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="parentName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Parent/Guardian Name *
            </label>
            <input
              type="text"
              id="parentName"
              value={info.parentName}
              onChange={(e) => handleChange('parentName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.parentName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Sarah Smith"
            />
            {errors.parentName && (
              <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="parentEmail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Parent/Guardian Email
            </label>
            <input
              type="email"
              id="parentEmail"
              value={info.parentEmail || ''}
              onChange={(e) => handleChange('parentEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., parent@email.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used to send intake forms (optional)
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next: Upload Documents
          </button>
        </div>
      </form>
    </div>
  );
}
