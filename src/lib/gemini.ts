/**
 * Gemini AI Integration
 *
 * Handles all AI interactions for IEP generation.
 * IMPORTANT: All text sent to this module MUST already be PII-masked.
 */

// TODO: Install @google/generative-ai package
// npm install @google/generative-ai

interface GeminiConfig {
  apiKey: string;
  model?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface GenerationResult {
  text: string;
  finishReason: string;
}

/**
 * Creates a Gemini client instance
 * In production, initialize this server-side only
 */
export function createGeminiClient(config: GeminiConfig) {
  // TODO: Implement with actual Gemini SDK
  // const genAI = new GoogleGenerativeAI(config.apiKey);
  // const model = genAI.getGenerativeModel({ model: config.model || 'gemini-pro' });

  return {
    /**
     * Generate content based on a prompt
     * Use for one-off generations like PLEP, PWN, etc.
     */
    async generate(prompt: string, systemPrompt?: string): Promise<GenerationResult> {
      // TODO: Implement
      console.log('Gemini generate called with:', { prompt, systemPrompt });
      return {
        text: '[AI Response Placeholder - Implement Gemini SDK]',
        finishReason: 'placeholder',
      };
    },

    /**
     * Interactive chat for collaborative sections like goal writing
     * Maintains conversation history
     */
    async chat(
      messages: ChatMessage[],
      systemPrompt?: string
    ): Promise<GenerationResult> {
      // TODO: Implement
      console.log('Gemini chat called with:', { messages, systemPrompt });
      return {
        text: '[AI Chat Response Placeholder - Implement Gemini SDK]',
        finishReason: 'placeholder',
      };
    },
  };
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
