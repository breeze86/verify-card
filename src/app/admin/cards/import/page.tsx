"use client";

import { useState } from "react";
import Link from "next/link";

interface PreviewRow {
  row: number;
  data: Record<string, string>;
  errors: string[];
  exists: boolean;
}

interface PreviewResult {
  total: number;
  valid: number;
  invalid: number;
  new: number;
  update: number;
  rows: PreviewRow[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<{imported: number; failed: number} | null>(null);
  const [error, setError] = useState("");

  const handlePreview = async () => {
    if (!file) {
      setError("请选择CSV文件");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", "preview");

    try {
      const res = await fetch("/admin/api/cards/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "预览失败");
        return;
      }

      setPreview(data);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", "import");

    try {
      const res = await fetch("/admin/api/cards/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "导入失败");
        return;
      }

      setImportResult(data);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/cards" className="text-slate-500 hover:text-slate-700">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold text-slate-800">批量导入卡片</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 下载模板 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">下载模板</h2>
          <p className="text-blue-600 mb-4">
            请先下载CSV模板，按照模板格式填写数据后再上传
          </p>
          <Link
            href="/admin/api/cards/template"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            下载CSV模板
          </Link>
        </div>

        {/* 上传文件 */}
        {!preview && !importResult && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">上传CSV文件</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg"
              />

              <div className="flex gap-4">
                <button
                  onClick={handlePreview}
                  disabled={loading || !file}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {loading ? "处理中..." : "预览数据"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 预览结果 */}
        {preview && !importResult && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">数据预览</h2>

            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-800">{preview.total}</div>
                <div className="text-sm text-slate-500">总行数</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{preview.valid}</div>
                <div className="text-sm text-green-600">有效数据</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{preview.invalid}</div>
                <div className="text-sm text-red-600">错误数据</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{preview.new}</div>
                <div className="text-sm text-blue-600">新增</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-600">{preview.update}</div>
                <div className="text-sm text-amber-600">更新</div>
              </div>
            </div>

            {/* 数据表格 */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">行号</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">卡号</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">商品名称</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">类型</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {preview.rows.slice(0, 10).map((row) => (
                    <tr key={row.row} className={row.errors.length > 0 ? "bg-red-50" : ""}>
                      <td className="px-4 py-2 text-sm">{row.row}</td>
                      <td className="px-4 py-2 text-sm font-mono">{row.data.cardNo}</td>
                      <td className="px-4 py-2 text-sm">{row.data.productName}</td>
                      <td className="px-4 py-2 text-sm">
                        {row.exists ? (
                          <span className="text-amber-600">更新</span>
                        ) : (
                          <span className="text-blue-600">新增</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {row.errors.length > 0 ? (
                          <span className="text-red-600" title={row.errors.join(", ")}>
                            错误 ({row.errors.length})
                          </span>
                        ) : (
                          <span className="text-green-600">有效</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.rows.length > 10 && (
                <div className="text-center py-4 text-slate-500">
                  还有 {preview.rows.length - 10} 行数据...
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <button
                onClick={handleImport}
                disabled={loading || preview.valid === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300"
              >
                {loading ? "导入中..." : `确认导入 (${preview.valid}条)`}
              </button>
              <button
                onClick={() => setPreview(null)}
                disabled={loading}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                重新上传
              </button>
            </div>
          </div>
        )}

        {/* 导入结果 */}
        {importResult && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">导入完成</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-sm text-green-600">成功导入</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                <div className="text-sm text-red-600">导入失败</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/admin/cards"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                返回卡片列表
              </Link>
              <button
                onClick={() => {
                  setPreview(null);
                  setImportResult(null);
                  setFile(null);
                }}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                继续导入
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
