"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api";
import { ALL_TEST_TYPES, Lesson, TestType } from "@/types";

export default function LessonsPage() {
  const [selectedCategory, setSelectedCategory] = useState<TestType | "ALL">("ALL");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const params = selectedCategory === "ALL" ? {} : { category: selectedCategory };
    api
      .get<{ lessons: Lesson[] }>("/api/lessons", { params })
      .then((res) => {
        if (active) setLessons(res.data.lessons);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, "Failed to load lessons"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lessons</h1>
        <p className="text-sm text-slate-600">
          Browse study guides and strategy lessons by exam.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            selectedCategory === "ALL"
              ? "bg-indigo-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        {ALL_TEST_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedCategory(type)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              selectedCategory === type
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading lessons...</div>
      ) : lessons.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No lessons found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {lesson.category}
                  </span>
                  <span className="text-xs text-slate-400">#{lesson.order}</span>
                </div>
                <h2 className="mt-3 text-base font-semibold text-slate-900">
                  {lesson.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {lesson.content}
                </p>
              </div>
              <div className="mt-4 text-xs font-medium text-indigo-600">
                Read lesson →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
