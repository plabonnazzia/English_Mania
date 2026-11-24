"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import ProgressChart from "@/components/progress/ProgressChart";
import { api, getApiErrorMessage } from "@/lib/api";
import { ProgressItem } from "@/types";

export default function ProgressPage() {
  const [history, setHistory] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<{ history: ProgressItem[] }>("/api/progress/history")
      .then((res) => {
        if (active) setHistory(res.data.history);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, "Failed to load progress"));
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Progress &amp; Analytics</h1>
          <p className="text-sm text-slate-600">
            Track your mock test scores over time.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-slate-500">Loading progress...</div>
        ) : (
          <>
            <ProgressChart history={history} />

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Attempt History
              </h2>
              {history.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No attempts yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                        <th className="py-2 pr-4">Test</th>
                        <th className="py-2 pr-4">Exam</th>
                        <th className="py-2 pr-4">Score</th>
                        <th className="py-2 pr-4">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="py-2.5 pr-4 font-medium text-slate-900">
                            {item.test.title}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-600">
                            {item.test.type} · {item.test.section}
                          </td>
                          <td className="py-2.5 pr-4 font-semibold text-indigo-600">
                            {item.score}/{item.maxScore}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-500">
                            {Math.round(item.timeTaken / 60)}m
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
