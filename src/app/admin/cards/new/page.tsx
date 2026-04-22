"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/admin/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          issueYear: parseInt(data.issueYear as string, 10),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "创建失败");
        return;
      }

      router.push("/admin/cards");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/cards" className="text-slate-500 hover:text-slate-700">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold text-slate-800">新增卡片</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  证书编号 <span className="text-red-500">*</span>
                </label>
                <input
                  name="certNo"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  商品品牌 <span className="text-red-500">*</span>
                </label>
                <input
                  name="brand"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  商品名称 <span className="text-red-500">*</span>
                </label>
                <input
                  name="productName"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  发行年份 <span className="text-red-500">*</span>
                </label>
                <input
                  name="issueYear"
                  type="number"
                  required
                  min={1900}
                  max={2100}
                  defaultValue={new Date().getFullYear()}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  语言 <span className="text-red-500">*</span>
                </label>
                <input
                  name="language"
                  type="text"
                  required
                  defaultValue="English"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  商品编号 <span className="text-red-500">*</span>
                </label>
                <input
                  name="productNo"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  评分 <span className="text-red-500">*</span>
                </label>
                <input
                  name="grade"
                  type="text"
                  required
                  placeholder="如: PSA 10"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  正面照片链接 <span className="text-red-500">*</span>
                </label>
                <input
                  name="frontImageUrl"
                  type="url"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  背面照片链接 <span className="text-red-500">*</span>
                </label>
                <input
                  name="backImageUrl"
                  type="url"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  状态
                </label>
                <select
                  name="status"
                  defaultValue="active"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900 bg-white"
                >
                  <option value="active">有效</option>
                  <option value="inactive">无效</option>
                  <option value="expired">已过期</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300"
              >
                {loading ? "保存中..." : "保存"}
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
