"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LessonContent from "@/components/lessons/LessonContent";
import { api, getApiErrorMessage } from "@/lib/api";
import { Lesson } from "@/types";

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let active = true;
    setLoading(true);
    api
      .get<{ lesson: Lesson }>(`/api/lessons/${params.id}`)
      .then((res) => {
        if (active) setLesson(res.data.lesson);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, "Lesson not found"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params?.id]);

  return (
    <div className="space-y-6">
      <Link
        href="/lessons"
        className="inline-block text-sm font-medium text-indigo-600 hover:underline"
      >
        ← Back to Lessons
      </Link>

      {loading ? (
        <div className="text-sm text-slate-500">Loading lesson...</div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : lesson ? (
        <LessonContent lesson={lesson} />
      ) : null}
    </div>
  );
}
