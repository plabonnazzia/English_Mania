"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { DashboardStats } from "@/types";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get<DashboardStats>("/api/progress/dashboard")
      .then((res) => {
        if (active) setStats(res.data);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, "Failed to load dashboard"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-slate-600">
              Track your test scores, study time, and due flashcards.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/lessons"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Study Lessons
            </Link>
            <Link
              href="/tests"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Take a Test
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-slate-500">Loading dashboard...</div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-medium uppercase text-slate-500">
                  Tests Completed
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.totalTests}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-medium uppercase text-slate-500">
                  Average Score
                </div>
                <div className="mt-2 text-3xl font-bold text-indigo-600">
                  {Math.round(stats.averagePercentage * 100)}%
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-medium uppercase text-slate-500">
                  Study Time
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {formatDuration(stats.totalTimeSeconds)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-medium uppercase text-slate-500">
                  Flashcards Due
                </div>
                <div className="mt-2 text-3xl font-bold text-amber-600">
                  {stats.flashcardsDue}
                </div>
                <Link
                  href="/flashcards"
                  className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline"
                >
                  Review now →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">
                  Performance by Exam
                </h2>
                {Object.keys(stats.byTestType).length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    No test attempts yet. Take your first mock test!
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {Object.entries(stats.byTestType).map(([type, info]) => (
                      <li
                        key={type}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium text-slate-800">{type}</span>
                        <span className="text-slate-600">
                          {info.attempts} attempt{info.attempts === 1 ? "" : "s"} ·{" "}
                          {Math.round(info.averagePercentage * 100)}% avg
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">
                  Recent Activity
                </h2>
                {stats.recentProgress.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No recent activity.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {stats.recentProgress.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <div className="font-medium text-slate-800">
                            {item.test.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.test.type} · {item.test.section}
                          </div>
                        </div>
                        <span className="font-semibold text-indigo-600">
                          {item.score}/{item.maxScore}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AuthGuard>
  );
}
