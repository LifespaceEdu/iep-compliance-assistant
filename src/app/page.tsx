import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IEP Compliance Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate compliant IEP documents with AI assistance.
            Privacy-first design ensures student data is never exposed.
          </p>
        </header>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Link
            href="/case/new"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              New IEP Case
            </h2>
            <p className="text-gray-600">
              Start a new IEP with the step-by-step wizard. Upload documents,
              answer questions, and generate compliant content.
            </p>
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 opacity-60">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
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
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Continue Draft
            </h2>
            <p className="text-gray-600">
              Pick up where you left off on an in-progress IEP.
            </p>
            <span className="inline-block mt-3 text-sm text-gray-400">
              Coming soon
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mb-3">
                1
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Enter Student Info</h3>
              <p className="text-sm text-gray-600">
                Student data is masked with placeholders before any AI processing.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mb-3">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Upload & Analyze</h3>
              <p className="text-sm text-gray-600">
                Upload previous IEP and testing data. AI analyzes and summarizes.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mb-3">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Generate Content</h3>
              <p className="text-sm text-gray-600">
                Interactive Q&A generates PLEP, goals, objectives, and PWN.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Privacy-first design: Student PII is replaced with placeholders before AI processing.
            Real names are only restored in your final documents.
          </p>
        </div>
      </div>
    </div>
  );
}
