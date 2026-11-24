import Link from "next/link";
import { ALL_TEST_TYPES } from "@/types";

export default function HomePage() {
  return (
    <div className="space-y-12 py-6">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-6 py-12 text-white shadow-sm md:px-12">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          Master IELTS, GRE, TOEFL, PTE, SAT, DET &amp; Cambridge Exams
        </h1>
        <p className="mt-4 max-w-xl text-indigo-100">
          Structured lessons, realistic timed mock tests with official score
          scales, and SM-2 spaced repetition flashcards in one unified platform.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Get Started Free
          </Link>
          <Link
            href="/lessons"
            className="rounded-lg border border-indigo-300 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Browse Lessons
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Supported Exams</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ALL_TEST_TYPES.map((exam) => (
            <Link
              key={exam}
              href={`/lessons?category=${exam}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
            >
              <div className="text-lg font-bold text-indigo-600">{exam}</div>
              <div className="mt-1 text-xs text-slate-500">
                Lessons &amp; Practice Tests
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
