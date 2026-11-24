"use client";

import { Question } from "@/types";

interface UseOfEnglishQuestionProps {
  question: Question;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function UseOfEnglishQuestion({
  question,
  value,
  onChange,
  disabled = false,
}: UseOfEnglishQuestionProps) {
  const typeLabel =
    question.questionType === "CLOZE"
      ? "Open Cloze"
      : question.questionType === "WORD_FORMATION"
        ? "Word Formation"
        : "Key Word Transformation";

  return (
    <div className="space-y-3">
      <span className="inline-block rounded bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
        {typeLabel}
      </span>
      <p className="text-base font-medium text-slate-900">{question.questionText}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer..."
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
      />
    </div>
  );
}
