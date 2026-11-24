"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import TestInterface from "@/components/tests/TestInterface";
import { api, getApiErrorMessage } from "@/lib/api";
import { Question, TestSummary } from "@/types";

export default function TestDetailPage() {
  const params = useParams<{ id: string }>();
  const [test, setTest] = useState<TestSummary | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let active = true;
    setLoading(true);
    api
      .get<{ test: TestSummary; questions: Question[] }>(
        `/api/tests/${params.id}/questions`
      )
      .then((res) => {
        if (active) {
          setTest(res.data.test);
          setQuestions(res.data.questions);
        }
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, "Test not found"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params?.id]);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <Link
          href="/tests"
          className="inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Back to Tests
        </Link>

        {loading ? (
          <div className="text-sm text-slate-500">Loading test...</div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : test ? (
          <TestInterface test={test} questions={questions} />
        ) : null}
      </div>
    </AuthGuard>
  );
}
