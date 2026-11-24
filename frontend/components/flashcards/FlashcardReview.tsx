"use client";

import { useState } from "react";
import { Flashcard } from "@/types";

interface FlashcardReviewProps {
  cards: Flashcard[];
  onReview: (cardId: string, quality: number) => Promise<void>;
}

const QUALITY_BUTTONS = [
  { q: 0, label: "0 · Blackout", cls: "bg-red-600 hover:bg-red-700 text-white" },
  { q: 1, label: "1 · Wrong", cls: "bg-red-500 hover:bg-red-600 text-white" },
  { q: 2, label: "2 · Hard", cls: "bg-amber-500 hover:bg-amber-600 text-white" },
  { q: 3, label: "3 · Good", cls: "bg-sky-600 hover:bg-sky-700 text-white" },
  { q: 4, label: "4 · Easy", cls: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  { q: 5, label: "5 · Perfect", cls: "bg-indigo-600 hover:bg-indigo-700 text-white" },
];

export default function FlashcardReview({ cards, onReview }: FlashcardReviewProps) {
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="text-lg font-semibold text-slate-900">
          All caught up!
        </div>
        <p className="mt-1 text-sm text-slate-500">
          No flashcards are due for review right now. Create a new card below.
        </p>
      </div>
    );
  }

  const card = cards[0];

  const handleRate = async (quality: number) => {
    setSubmitting(true);
    try {
      await onReview(card.id, quality);
      setFlipped(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{cards.length} card(s) due</span>
        <span>
          {card.category} · Repetitions: {card.repetitions} · Interval: {card.interval}d
        </span>
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:border-indigo-300"
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {flipped ? "Answer (Back)" : "Prompt (Front) — Click to flip"}
        </div>
        <div className="mt-4 text-2xl font-bold text-slate-900">
          {flipped ? card.back : card.front}
        </div>
      </div>

      {flipped && (
        <div className="space-y-2">
          <div className="text-center text-xs font-medium text-slate-600">
            Rate your recall quality (SM-2):
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
            {QUALITY_BUTTONS.map((btn) => (
              <button
                key={btn.q}
                type="button"
                disabled={submitting}
                onClick={() => handleRate(btn.q)}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${btn.cls}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
