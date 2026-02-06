import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { IEPCase, Teacher } from '@/types/database';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get teacher's cases
  const { data: casesData } = await supabase
    .from('iep_cases')
    .select('*')
    .order('updated_at', { ascending: false });

  const cases = casesData as IEPCase[] | null;

  // Get teacher profile
  const { data: teacherData } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', user.id)
    .single();

  const teacher = teacherData as Teacher | null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            IEP Compliance Assistant
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {teacher?.full_name || user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your IEP Cases</h2>
          <Link
            href="/case/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
            New IEP Case
          </Link>
        </div>

        {/* Cases Grid */}
        {cases && cases.length > 0 ? (
          <div className="grid gap-4">
            {cases.map((iepCase) => (
              <Link
                key={iepCase.id}
                href={`/case/${iepCase.id}`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {iepCase.student_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {iepCase.school_name} • {iepCase.grade_level}
                    </p>
                  </div>
                  <StatusBadge status={iepCase.status} />
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    Created{' '}
                    {new Date(iepCase.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    Updated{' '}
                    {new Date(iepCase.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No IEP cases yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first case to get started with AI-assisted IEP generation.
            </p>
            <Link
              href="/case/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
              Create First Case
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    intake: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-purple-100 text-purple-800',
    complete: 'bg-green-100 text-green-800',
  };

  const labels = {
    intake: 'Intake',
    in_progress: 'In Progress',
    review: 'Review',
    complete: 'Complete',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
