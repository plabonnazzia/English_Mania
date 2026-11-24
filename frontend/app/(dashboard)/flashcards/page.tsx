"use client";

import { useCallback, useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import FlashcardReview from "@/components/flashcards/FlashcardReview";
import { api, getApiErrorMessage } from "@/lib/api";
import { ALL_TEST_TYPES, Flashcard, TestType } from "@/types";

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [category, setCategory] = useState<TestType>("IELTS");
  const [creating, setCreating] = useState(false);

  const loadDue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ flashcards: Flashcard[] }>("/api/flashcards/due");
      setCards(res.data.flashcards);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load flashcards"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDue();
  }, [loadDue]);

  const handleReview = async (cardId: string, quality: number) => {
    await api.post(`/api/flashcards/${cardId}/review`, { quality });
    await loadDue();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.post("/api/flashcards", { front, back, category });
      setFront("");
      setBack("");
      await loadDue();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create flashcard"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flashcards (SM-2)</h1>
          <p className="text-sm text-slate-600">
            Review due vocabulary cards using spaced repetition.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-slate-500">Loading due cards...</div>
        ) : (
          <FlashcardReview cards={cards} onReview={handleReview} />
        )}

        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <h2 className="text-base font-semibold text-slate-900">
            Add New Flashcard
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Front (word or prompt)"
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Back (definition or answer)"
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TestType)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {ALL_TEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? "Adding..." : "Add Flashcard"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
