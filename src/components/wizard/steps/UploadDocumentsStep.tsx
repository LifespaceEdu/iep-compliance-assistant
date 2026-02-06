'use client';

import { useState, useCallback } from 'react';

interface UploadDocumentsStepProps {
  caseId?: string;
  previousIEPPath?: string;
  testingDataPath?: string;
  onUpdate: (data: {
    previousIEPPath?: string;
    previousIEPText?: string;
    testingDataPath?: string;
    testingDataText?: string;
  }) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  extractedText: string | null;
}

export function UploadDocumentsStep({
  caseId,
  previousIEPPath,
  testingDataPath,
  onUpdate,
  onNext,
  onPrev,
}: UploadDocumentsStepProps) {
  const [previousIEP, setPreviousIEP] = useState<UploadState>({
    file: null,
    uploading: false,
    uploaded: !!previousIEPPath,
    error: null,
    extractedText: null,
  });

  const [testingData, setTestingData] = useState<UploadState>({
    file: null,
    uploading: false,
    uploaded: !!testingDataPath,
    error: null,
    extractedText: null,
  });

  const handleFileSelect = (
    type: 'previousIEP' | 'testingData',
    file: File | null
  ) => {
    const setter = type === 'previousIEP' ? setPreviousIEP : setTestingData;
    if (file === null) {
      // Reset the entire state when clearing
      setter({
        file: null,
        uploading: false,
        uploaded: false,
        error: null,
        extractedText: null,
      });
    } else {
      setter((prev) => ({
        ...prev,
        file,
        error: null,
      }));
    }
  };

  const uploadFile = async (
    type: 'previousIEP' | 'testingData',
    state: UploadState,
    setState: React.Dispatch<React.SetStateAction<UploadState>>
  ) => {
    if (!state.file || !caseId) return;

    setState((prev) => ({ ...prev, uploading: true, error: null }));

    const formData = new FormData();
    formData.append('file', state.file);
    formData.append('caseId', caseId);
    formData.append(
      'documentType',
      type === 'previousIEP' ? 'previous_iep' : 'testing_data'
    );

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setState((prev) => ({
        ...prev,
        uploading: false,
        uploaded: true,
        extractedText: result.extractedText,
      }));

      // Update parent with extracted text
      if (type === 'previousIEP') {
        onUpdate({
          previousIEPPath: result.fileName,
          previousIEPText: result.extractedText,
        });
      } else {
        onUpdate({
          testingDataPath: result.fileName,
          testingDataText: result.extractedText,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  };

  const handleDrop = useCallback(
    (type: 'previousIEP' | 'testingData') =>
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
          handleFileSelect(type, file);
        }
      },
    []
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h2>
      <p className="text-gray-600 mb-6">
        Upload the previous IEP and any testing data. The system will extract
        text for analysis.
      </p>

      <div className="space-y-8">
        {/* Previous IEP Upload */}
        <DocumentUpload
          label="Previous IEP"
          description="Upload the student's most recent IEP document"
          state={previousIEP}
          onFileSelect={(file) => handleFileSelect('previousIEP', file)}
          onUpload={() => uploadFile('previousIEP', previousIEP, setPreviousIEP)}
          onDrop={handleDrop('previousIEP')}
          onDragOver={handleDragOver}
        />

        {/* Testing Data Upload */}
        <DocumentUpload
          label="Testing Data"
          description="Upload assessment results, evaluations, or other testing data"
          state={testingData}
          onFileSelect={(file) => handleFileSelect('testingData', file)}
          onUpload={() => uploadFile('testingData', testingData, setTestingData)}
          onDrop={handleDrop('testingData')}
          onDragOver={handleDragOver}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!previousIEP.uploaded && !testingData.uploaded}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Document Analysis
        </button>
      </div>
    </div>
  );
}

interface DocumentUploadProps {
  label: string;
  description: string;
  state: UploadState;
  onFileSelect: (file: File | null) => void;
  onUpload: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

function DocumentUpload({
  label,
  description,
  state,
  onFileSelect,
  onUpload,
  onDrop,
  onDragOver,
}: DocumentUploadProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{label}</h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>

      {state.uploaded ? (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="font-medium text-green-800">Document uploaded</p>
              <p className="text-sm text-green-600">
                {state.extractedText
                  ? `${state.extractedText.length.toLocaleString()} characters extracted`
                  : 'Processing...'}
              </p>
            </div>
            <button
              onClick={() => onFileSelect(null)}
              className="ml-auto text-sm text-green-700 hover:text-green-900"
            >
              Replace
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            state.file
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {state.file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{state.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(state.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => onFileSelect(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Remove
                </button>
                <button
                  onClick={onUpload}
                  disabled={state.uploading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {state.uploading ? 'Uploading...' : 'Upload & Extract Text'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-600 mb-2">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-sm text-gray-500">PDF or TXT files only</p>
              <input
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </>
          )}
        </div>
      )}

      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}
