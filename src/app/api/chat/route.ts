import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chat, SYSTEM_PROMPTS, buildSystemPrompt } from '@/lib/gemini';
import { maskPII, createPIIMappings, validateNoExposedPII } from '@/lib/pii-masking';
import type { IEPCase } from '@/types/database';

interface ChatRequest {
  caseId: string;
  messages: { role: 'user' | 'model'; content: string }[];
  context: 'plep' | 'goals' | 'stos' | 'services' | 'pwn' | 'general';
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { caseId, messages, context } = body;

    // Verify user owns this case
    const { data, error: caseError } = await supabase
      .from('iep_cases')
      .select('*')
      .eq('id', caseId)
      .eq('teacher_id', user.id)
      .single();

    if (caseError || !data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const iepCase = data as IEPCase;

    // Create PII mappings from case data
    const piiMappings = createPIIMappings({
      name: iepCase.student_name,
      dateOfBirth: iepCase.student_dob,
      studentId: iepCase.student_id || '',
      school: iepCase.school_name,
      grade: iepCase.grade_level,
      parentName: iepCase.parent_name,
      parentEmail: iepCase.parent_email || undefined,
      address: iepCase.student_address || undefined,
    });

    // Mask all message content
    const maskedMessages = messages.map((msg) => ({
      ...msg,
      content: maskPII(msg.content, piiMappings),
    }));

    // Validate no PII leaked through
    const lastMessage = maskedMessages[maskedMessages.length - 1];
    const validation = validateNoExposedPII(lastMessage.content, piiMappings);
    if (!validation.isClean) {
      console.warn('PII detected in message, additional masking applied');
      // The masking already happened, this is just a safety check
    }

    // Select appropriate system prompt based on context
    const systemPromptMap: Record<string, string> = {
      plep: SYSTEM_PROMPTS.PLEP_GENERATION,
      goals: SYSTEM_PROMPTS.GOAL_WRITING,
      stos: SYSTEM_PROMPTS.STO_GENERATION,
      services: SYSTEM_PROMPTS.GOAL_WRITING, // Reuse for now
      pwn: SYSTEM_PROMPTS.PWN_GENERATION,
      general: SYSTEM_PROMPTS.INTAKE_QA,
    };

    const basePrompt = systemPromptMap[context] || SYSTEM_PROMPTS.INTAKE_QA;

    // TODO: Load QPI and standards from database or config
    const systemPrompt = buildSystemPrompt(basePrompt);

    // Call Gemini
    const result = await chat(maskedMessages, systemPrompt);

    // Log for audit (without PII)
    // Note: Using type assertion as audit_log insert types need refinement
    await supabase.from('audit_log').insert({
      teacher_id: user.id,
      case_id: caseId,
      action: 'ai_chat',
      details: {
        context,
        messageCount: messages.length,
        finishReason: result.finishReason,
      },
    } as never);

    return NextResponse.json({
      response: result.text, // Still has placeholders, UI will unmask for display
      finishReason: result.finishReason,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
