/**
 * PII Masking Utilities
 *
 * CRITICAL SECURITY COMPONENT
 *
 * This module handles masking and unmasking of Personally Identifiable Information (PII)
 * before any content is sent to the AI model. The AI should NEVER see real student data.
 *
 * Flow:
 * 1. Teacher enters real student info (stored in database)
 * 2. Before AI call: maskPII() replaces real values with placeholders
 * 3. AI generates content with placeholders
 * 4. For display: unmaskPII() restores real values
 */

import { StudentInfo, PIIMappings } from '@/types/iep';

// Placeholder tokens - these are what the AI sees
export const PLACEHOLDERS = {
  STUDENT_NAME: '[STUDENT_NAME]',
  STUDENT_FIRST: '[STUDENT_FIRST]',
  DOB: '[DATE_OF_BIRTH]',
  STUDENT_ID: '[STUDENT_ID]',
  SCHOOL: '[SCHOOL_NAME]',
  GRADE: '[GRADE_LEVEL]',
  PARENT_NAME: '[PARENT_NAME]',
  ADDRESS: '[ADDRESS]',
  // Pronouns - AI will use these, we don't replace them
  HE_SHE: '[HE/SHE]',
  HIM_HER: '[HIM/HER]',
  HIS_HER: '[HIS/HER]',
} as const;

/**
 * Creates a mapping from real PII values to placeholders
 */
export function createPIIMappings(studentInfo: StudentInfo): PIIMappings {
  const mappings: PIIMappings = {};

  // Full name
  if (studentInfo.name) {
    mappings[studentInfo.name] = PLACEHOLDERS.STUDENT_NAME;

    // Also map first name separately (common in IEP writing)
    const firstName = studentInfo.name.split(' ')[0];
    if (firstName && firstName !== studentInfo.name) {
      mappings[firstName] = PLACEHOLDERS.STUDENT_FIRST;
    }

    // Map lowercase and uppercase variants
    mappings[studentInfo.name.toLowerCase()] = PLACEHOLDERS.STUDENT_NAME;
    mappings[studentInfo.name.toUpperCase()] = PLACEHOLDERS.STUDENT_NAME;
    mappings[firstName.toLowerCase()] = PLACEHOLDERS.STUDENT_FIRST;
    mappings[firstName.toUpperCase()] = PLACEHOLDERS.STUDENT_FIRST;
  }

  if (studentInfo.dateOfBirth) {
    mappings[studentInfo.dateOfBirth] = PLACEHOLDERS.DOB;
    // Common date format variations
    const dobDate = new Date(studentInfo.dateOfBirth);
    if (!isNaN(dobDate.getTime())) {
      mappings[dobDate.toLocaleDateString()] = PLACEHOLDERS.DOB;
      mappings[dobDate.toISOString().split('T')[0]] = PLACEHOLDERS.DOB;
    }
  }

  if (studentInfo.studentId) {
    mappings[studentInfo.studentId] = PLACEHOLDERS.STUDENT_ID;
  }

  if (studentInfo.school) {
    mappings[studentInfo.school] = PLACEHOLDERS.SCHOOL;
    mappings[studentInfo.school.toLowerCase()] = PLACEHOLDERS.SCHOOL;
    mappings[studentInfo.school.toUpperCase()] = PLACEHOLDERS.SCHOOL;
  }

  if (studentInfo.grade) {
    mappings[studentInfo.grade] = PLACEHOLDERS.GRADE;
  }

  if (studentInfo.parentName) {
    mappings[studentInfo.parentName] = PLACEHOLDERS.PARENT_NAME;
    mappings[studentInfo.parentName.toLowerCase()] = PLACEHOLDERS.PARENT_NAME;
    mappings[studentInfo.parentName.toUpperCase()] = PLACEHOLDERS.PARENT_NAME;
  }

  if (studentInfo.address) {
    mappings[studentInfo.address] = PLACEHOLDERS.ADDRESS;
  }

  return mappings;
}

/**
 * Masks all PII in a text string before sending to AI
 *
 * @param text - The text containing potential PII
 * @param mappings - The PII to placeholder mappings
 * @returns Text with all PII replaced by placeholders
 */
export function maskPII(text: string, mappings: PIIMappings): string {
  let maskedText = text;

  // Sort by length (longest first) to avoid partial replacements
  // e.g., "John Smith" should be replaced before "John"
  const sortedKeys = Object.keys(mappings).sort((a, b) => b.length - a.length);

  for (const realValue of sortedKeys) {
    const placeholder = mappings[realValue];
    // Use a case-insensitive global replace
    const regex = new RegExp(escapeRegExp(realValue), 'gi');
    maskedText = maskedText.replace(regex, placeholder);
  }

  return maskedText;
}

/**
 * Restores PII in AI-generated text for display to the teacher
 *
 * @param text - The text containing placeholders
 * @param mappings - The PII to placeholder mappings
 * @returns Text with placeholders replaced by real values
 */
export function unmaskPII(text: string, mappings: PIIMappings): string {
  let unmaskedText = text;

  // Create reverse mapping (placeholder -> real value)
  // Use the first (most complete) real value for each placeholder
  const reverseMappings: Record<string, string> = {};
  for (const [realValue, placeholder] of Object.entries(mappings)) {
    // Only use the first mapping for each placeholder (longest/most complete)
    if (!reverseMappings[placeholder]) {
      reverseMappings[placeholder] = realValue;
    }
  }

  for (const [placeholder, realValue] of Object.entries(reverseMappings)) {
    const regex = new RegExp(escapeRegExp(placeholder), 'g');
    unmaskedText = unmaskedText.replace(regex, realValue);
  }

  return unmaskedText;
}

/**
 * Validates that text contains no known PII
 * Use this as a safety check before sending to AI
 *
 * @param text - The text to check
 * @param mappings - The PII mappings
 * @returns Object with isClean boolean and any found PII
 */
export function validateNoExposedPII(
  text: string,
  mappings: PIIMappings
): { isClean: boolean; exposedValues: string[] } {
  const exposedValues: string[] = [];
  const textLower = text.toLowerCase();

  for (const realValue of Object.keys(mappings)) {
    if (realValue.length > 2 && textLower.includes(realValue.toLowerCase())) {
      exposedValues.push(realValue);
    }
  }

  return {
    isClean: exposedValues.length === 0,
    exposedValues,
  };
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Masks PII in an object recursively (for structured data)
 */
export function maskPIIInObject<T>(obj: T, mappings: PIIMappings): T {
  if (typeof obj === 'string') {
    return maskPII(obj, mappings) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => maskPIIInObject(item, mappings)) as T;
  }

  if (typeof obj === 'object' && obj !== null) {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      masked[key] = maskPIIInObject(value, mappings);
    }
    return masked as T;
  }

  return obj;
}
