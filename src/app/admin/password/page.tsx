"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const submittedRef = useRef(false);

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 防止重复提交
    if (loading || submittedRef.current) return;
    submittedRef.current = true;

    setLoading(true);
    setError("");
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("新密码至少需要6位");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/admin/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setError("服务器返回数据格式错误");
        return;
      }

      if (!res.ok) {
        setError(data.error || "修改密码失败");
        return;
      }

      setSuccess(true);
      form.reset();

      // 延迟后登出并跳转到登录页
      setTimeout(async () => {
        try {
          await fetch("/admin/api/auth/logout", {
            method: "POST",
            credentials: "same-origin"
          });
        } finally {
          // 使用 window.location 强制刷新跳转，确保 cookie 被清除
          window.location.href = "/admin/login";
        }
      }, 1500);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
      // 延迟重置 submittedRef，允许后续提交
      setTimeout(() => {
        submittedRef.current = false;
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/cards" className="text-slate-500 hover:text-slate-700">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold text-slate-800">修改密码</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              密码修改成功！即将跳转到登录页...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                当前密码 <span className="text-red-500">*</span>
              </label>
              <input
                name="currentPassword"
                type="password"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                新密码 <span className="text-red-500">*</span>
              </label>
              <input
                name="newPassword"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500">密码至少需要6位</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                确认新密码 <span className="text-red-500">*</span>
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300"
              >
                {loading ? "保存中..." : "修改密码"}
              </button>
              <Link
                href="/admin/cards"
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
