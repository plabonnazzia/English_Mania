"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api";
import { ALL_TEST_TYPES, TestSummary, TestType } from "@/types";

export default function TestsPage() {
  const [selectedType, setSelectedType] = useState<TestType | "ALL">("ALL");
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const params = selectedType === "ALL" ? {} : { type: selectedType };
    api
      .get<{ tests: TestSummary[] }>("/api/tests", { params })
      .then((res) => {
        if (active) setTests(res.data.tests);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, "Failed to load tests"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedType]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mock Tests</h1>
        <p className="text-sm text-slate-600">
          Timed practice tests across all 7 supported exams.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType("ALL")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            selectedType === "ALL"
              ? "bg-indigo-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        {ALL_TEST_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              selectedType === t
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No tests found for this exam.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {test.type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {test.duration} min · {test._count?.questions ?? 0} Qs
                  </span>
                </div>
                <h2 className="mt-3 text-base font-semibold text-slate-900">
                  {test.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">{test.section}</p>
              </div>
              <Link
                href={`/tests/${test.id}`}
                className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-center text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Start Test
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
