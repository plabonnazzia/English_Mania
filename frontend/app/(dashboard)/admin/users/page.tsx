"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Role, User } from "@/types";

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ users: User[] }>("/api/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      void loadUsers();
    } else {
      setLoading(false);
    }
  }, [currentUser, loadUsers]);

  const handleRoleChange = async (userId: string, role: Role) => {
    setError(null);
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role });
      await loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update role"));
    }
  };

  return (
    <AuthGuard>
      {currentUser?.role !== "ADMIN" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Forbidden: Admin access required.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin · Users
              </h1>
              <p className="text-sm text-slate-600">
                Manage user accounts and roles.
              </p>
            </div>
            <Link
              href="/admin/content"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage Content →
            </Link>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-slate-500">Loading users...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="py-2.5 pr-4 font-medium text-slate-900">
                        {u.name}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">{u.email}</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.role === "ADMIN"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleRoleChange(
                              u.id,
                              u.role === "ADMIN" ? "STUDENT" : "ADMIN"
                            )
                          }
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Make {u.role === "ADMIN" ? "STUDENT" : "ADMIN"}
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
