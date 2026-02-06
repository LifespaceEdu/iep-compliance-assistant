/**
 * Gemini AI Integration
 *
 * Handles all AI interactions for IEP generation.
 * IMPORTANT: All text sent to this module MUST already be PII-masked.
 */

import { GoogleGenerativeAI, Content } from '@google/generative-ai';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface GenerationResult {
  text: string;
  finishReason: string;
}

// Initialize Gemini client (server-side only)
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate content based on a prompt
 * Use for one-off generations like PLEP, PWN, etc.
 */
export async function generateContent(
  prompt: string,
  systemPrompt?: string
): Promise<GenerationResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;

  return {
    text: response.text(),
    finishReason: response.candidates?.[0]?.finishReason || 'UNKNOWN',
  };
}

/**
 * Interactive chat for collaborative sections like goal writing
 * Maintains conversation history
 */
export async function chat(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<GenerationResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: systemPrompt,
  });

  // Convert messages to Gemini format
  const history: Content[] = messages.slice(0, -1).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1];

  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;

  return {
    text: response.text(),
    finishReason: response.candidates?.[0]?.finishReason || 'UNKNOWN',
  };
}

/**
 * Stream content for real-time display
 * Useful for longer generations where user sees content appear
 */
export async function* streamContent(
  prompt: string,
  systemPrompt?: string
): AsyncGenerator<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

/**
 * System prompts for different IEP sections
 * These provide context to the AI about what to generate
 */
export const SYSTEM_PROMPTS = {
  // Analyze uploaded documents
  DOCUMENT_ANALYSIS: `You are an expert special education teacher analyzing documents for IEP development.
The student is referred to as [STUDENT_NAME] - this is a placeholder for privacy.
Analyze the provided documents and summarize:
1. Current academic performance levels
2. Key strengths identified
3. Areas of concern/need
4. Relevant assessment data
5. Previous goals and progress (if prior IEP provided)`,

  // Generate Present Levels of Educational Performance
  PLEP_GENERATION: `You are an expert special education teacher writing the Present Levels of Educational Performance (PLEP) section of an IEP.
The student is referred to as [STUDENT_NAME] - this is a placeholder for privacy.
Based on the information provided, write a comprehensive PLEP that:
1. Describes current academic achievement
2. Describes functional performance
3. States how the disability affects involvement in general education
4. Is written in clear, jargon-free language
5. Is strength-based while acknowledging areas of need
6. References specific data and assessments`,

  // Goal writing assistance
  GOAL_WRITING: `You are an expert special education teacher helping write IEP goals.
The student is referred to as [STUDENT_NAME] - this is a placeholder for privacy.
Help write measurable annual goals that:
1. Are based on the Present Levels
2. Follow SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
3. Include clear baseline data
4. Include measurement criteria
5. Are aligned with state standards where applicable`,

  // Generate Short-Term Objectives
  STO_GENERATION: `You are an expert special education teacher writing Short-Term Objectives (STOs) for an IEP.
The student is referred to as [STUDENT_NAME] - this is a placeholder for privacy.
For each annual goal, create 2-4 short-term objectives that:
1. Are measurable benchmarks toward the annual goal
2. Have clear criteria for success
3. Include target dates
4. Build progressively toward the annual goal`,

  // Generate Prior Written Notice
  PWN_GENERATION: `You are an expert special education teacher writing the Prior Written Notice (PWN) for an IEP.
The student is referred to as [STUDENT_NAME] - this is a placeholder for privacy.
Write a PWN that:
1. Describes the action being proposed or refused
2. Explains why the action is being proposed or refused
3. Describes options considered and why rejected
4. Describes evaluation procedures and relevant factors
5. Lists sources for parents to obtain assistance
6. Uses clear, parent-friendly language`,

  // Interactive Q&A for gathering information
  INTAKE_QA: `You are an expert special education teacher gathering information for an IEP.
The student is referred to as [STUDENT_NAME] - this is a placeholder for privacy.
Ask targeted questions to gather the information needed for a comprehensive IEP.
Ask one question at a time. Be specific and professional.
Focus on:
1. Current performance levels
2. Specific challenges and their impact
3. Successful strategies and accommodations
4. Student strengths and interests
5. Parent/teacher observations`,
};

/**
 * Reference data prompts
 * Load QPI and state standards into these for AI context
 */
export const REFERENCE_PROMPTS = {
  // Will be populated with actual QPI criteria
  QPI_CONTEXT: `The following is the Quality Performance Indicator (QPI) rubric that will be used to evaluate this IEP for compliance:
[QPI_CONTENT]

Ensure all generated content meets these quality standards.`,

  // Will be populated with Hawaii state standards
  STATE_STANDARDS: `The following are the relevant Hawaii state standards:
[STANDARDS_CONTENT]

Align goals and objectives to these standards where applicable.`,
};

/**
 * Helper to combine system prompts with reference data
 */
export function buildSystemPrompt(
  basePrompt: string,
  options?: {
    qpiContent?: string;
    standardsContent?: string;
  }
): string {
  let prompt = basePrompt;

  if (options?.qpiContent) {
    prompt +=
      '\n\n' +
      REFERENCE_PROMPTS.QPI_CONTEXT.replace('[QPI_CONTENT]', options.qpiContent);
  }

  if (options?.standardsContent) {
    prompt +=
      '\n\n' +
      REFERENCE_PROMPTS.STATE_STANDARDS.replace(
        '[STANDARDS_CONTENT]',
        options.standardsContent
      );
  }

  return prompt;
}
