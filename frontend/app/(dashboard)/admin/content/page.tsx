"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { ALL_TEST_TYPES, Lesson, TestType } from "@/types";

export default function AdminContentPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<TestType>("IELTS");
  const [order, setOrder] = useState(1);
  const [creating, setCreating] = useState(false);

  const loadLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ lessons: Lesson[] }>("/api/lessons");
      setLessons(res.data.lessons);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load lessons"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      void loadLessons();
    } else {
      setLoading(false);
    }
  }, [currentUser, loadLessons]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await api.post("/api/lessons", { title, content, category, order });
      setTitle("");
      setContent("");
      setOrder(1);
      await loadLessons();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create lesson"));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/api/lessons/${id}`);
      await loadLessons();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete lesson"));
    }
  };

  return (
    <AuthGuard>
      {currentUser?.role !== "ADMIN" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Forbidden: Admin access required.
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin · Content
              </h1>
              <p className="text-sm text-slate-600">
                Create and manage lessons across all exams.
              </p>
            </div>
            <Link
              href="/admin/users"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage Users →
            </Link>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <h2 className="text-base font-semibold text-slate-900">
              Create Lesson
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title"
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
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                placeholder="Order"
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Lesson content..."
              required
              className="w-full rounded-md border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Lesson"}
            </button>
          </form>

          {loading ? (
            <div className="text-sm text-slate-500">Loading lessons...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((l) => (
                    <tr key={l.id} className="border-b border-slate-100">
                      <td className="py-2.5 pr-4 font-medium text-slate-900">
                        {l.title}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">{l.category}</td>
                      <td className="py-2.5 pr-4 text-slate-500">{l.order}</td>
                      <td className="py-2.5 pr-4">
                        <button
                          type="button"
                          onClick={() => handleDelete(l.id)}
                          className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AuthGuard>
  );
}
