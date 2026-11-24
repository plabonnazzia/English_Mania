"use client";

import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import { Question, SubmitTestResponse, TestSummary } from "@/types";
import RecordingWidget from "./RecordingWidget";
import UseOfEnglishQuestion from "./UseOfEnglishQuestion";

interface TestInterfaceProps {
  test: TestSummary;
  questions: Question[];
}

interface AnswerState {
  answer?: string;
  textAnswer?: string;
  audioUrl?: string;
  videoUrl?: string;
}

export default function TestInterface({ test, questions }: TestInterfaceProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [secondsLeft, setSecondsLeft] = useState(test.duration * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const setAnswer = (questionId: string, patch: Partial<AnswerState>) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...patch },
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, val]) => ({
          questionId,
          ...val,
        })),
        timeTaken: Math.max(0, test.duration * 60 - secondsLeft),
      };
      const res = await api.post<SubmitTestResponse>(
        `/api/tests/${test.id}/submit`,
        payload
      );
      setResult(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to submit test"));
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {test.type} · {test.section}
          </span>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Test Results</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Raw Score</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {result.score} / {result.maxScore}
            </div>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <div className="text-xs uppercase text-indigo-600">Scaled Score</div>
            <div className="mt-1 text-2xl font-bold text-indigo-700">
              {result.scaledScore}
            </div>
            <div className="text-xs text-indigo-600">{result.scale}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Accuracy</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {Math.round(result.percentage * 100)}%
            </div>
          </div>
        </div>

        {result.pendingReview > 0 && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            {result.pendingReview} writing/speaking response(s) submitted for review.
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900">Answer Key</h3>
          {questions.map((q, idx) => {
            const item = result.correctAnswers.find((c) => c.questionId === q.id);
            return (
              <div
                key={q.id}
                className="rounded-lg border border-slate-200 p-4 text-sm"
              >
                <div className="font-medium text-slate-900">
                  {idx + 1}. {q.questionText}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-slate-600">
                    Correct: <strong>{item?.correctAnswer}</strong>
                  </span>
                  {item?.correct === true && (
                    <span className="font-semibold text-emerald-700">✓ Correct</span>
                  )}
                  {item?.correct === false && (
                    <span className="font-semibold text-red-600">✗ Incorrect</span>
                  )}
                  {item?.correct === null && (
                    <span className="font-semibold text-amber-700">Pending review</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        No questions available for this test.
      </div>
    );
  }

  const qType = q.questionType.toUpperCase();
  const isUseOfEnglish =
    qType === "CLOZE" ||
    qType === "WORD_FORMATION" ||
    qType === "KEY_WORD_TRANSFORMATION";
  const isSpeaking = qType.includes("SPEAKING");
  const isWriting = qType.includes("WRITING");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <div className="text-xs font-semibold uppercase text-indigo-600">
            {test.type} · {test.section}
          </div>
          <h1 className="text-lg font-bold text-slate-900">{test.title}</h1>
        </div>
        <div className="rounded-md bg-slate-100 px-3 py-1.5 font-mono text-sm font-semibold text-slate-800">
          ⏱ {formatTimer(secondsLeft)}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="text-xs font-medium text-slate-500">
          Question {currentIdx + 1} of {questions.length}
        </div>

        {q.audioUrl && (
          <audio src={q.audioUrl} controls className="w-full" />
        )}
        {q.imageUrl && (
          <img
            src={q.imageUrl}
            alt="Question visual"
            className="max-h-64 rounded-lg border border-slate-200 object-contain"
          />
        )}

        {isUseOfEnglish ? (
          <UseOfEnglishQuestion
            question={q}
            value={answers[q.id]?.answer ?? ""}
            onChange={(val) => setAnswer(q.id, { answer: val })}
          />
        ) : isSpeaking ? (
          <div className="space-y-3">
            <p className="text-base font-medium text-slate-900">{q.questionText}</p>
            <RecordingWidget
              mode={test.type === "DET" ? "video" : "audio"}
              existingUrl={answers[q.id]?.audioUrl ?? answers[q.id]?.videoUrl}
              onUploaded={(url) =>
                setAnswer(
                  q.id,
                  test.type === "DET" ? { videoUrl: url } : { audioUrl: url }
                )
              }
            />
          </div>
        ) : isWriting ? (
          <div className="space-y-3">
            <p className="text-base font-medium text-slate-900">{q.questionText}</p>
            <textarea
              rows={6}
              value={answers[q.id]?.textAnswer ?? ""}
              onChange={(e) => setAnswer(q.id, { textAnswer: e.target.value })}
              placeholder="Write your response..."
              className="w-full rounded-md border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-base font-medium text-slate-900">{q.questionText}</p>
            <div className="space-y-2">
              {(q.options ?? []).map((opt) => {
                const selected = answers[q.id]?.answer === opt;
                return (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      selected
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={selected}
                      onChange={() => setAnswer(q.id, { answer: opt })}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
