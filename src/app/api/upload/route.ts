import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Dynamic import for pdf-parse to handle CommonJS/ESM issues
async function parsePDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(buffer);
  return data.text;
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const documentType = formData.get('documentType') as 'previous_iep' | 'testing_data';

    if (!file || !caseId || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this case
    const { data: iepCase, error: caseError } = await supabase
      .from('iep_cases')
      .select('id')
      .eq('id', caseId)
      .eq('teacher_id', user.id)
      .single();

    if (caseError || !iepCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = '';

    // Extract text based on file type
    if (file.type === 'application/pdf') {
      try {
        extractedText = await parsePDF(buffer);
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json(
          { error: 'Failed to parse PDF' },
          { status: 400 }
        );
      }
    } else if (file.type === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or TXT files.' },
        { status: 400 }
      );
    }

    // Store file in Supabase Storage
    const fileName = `${caseId}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('iep-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      // Continue even if storage fails - we have the extracted text
    }

    // Update case with file path
    const updateField =
      documentType === 'previous_iep' ? 'previous_iep_path' : 'testing_data_path';

    await supabase
      .from('iep_cases')
      .update({ [updateField]: fileName } as never)
      .eq('id', caseId);

    // Log for audit
    await supabase.from('audit_log').insert({
      teacher_id: user.id,
      case_id: caseId,
      action: 'document_upload',
      details: {
        documentType,
        fileName: file.name,
        fileSize: file.size,
        textLength: extractedText.length,
      },
    } as never);

    return NextResponse.json({
      success: true,
      fileName,
      textLength: extractedText.length,
      extractedText, // Return extracted text for immediate use
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
