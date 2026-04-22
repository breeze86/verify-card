"use client";

import { useState } from "react";
import Link from "next/link";
import ImagePreview from "../../components/ImagePreview";

// 后端返回的英文字段名数据
interface CardData {
  certNo?: string;
  brand?: string;
  productName?: string;
  issueYear?: string;
  language?: string;
  productNo?: string;
  grade?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  status?: string;
  batchNo?: string;
  validStart?: string;
  validEnd?: string;
}

interface PreviewRow {
  row: number;
  data: CardData;
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

const PAGE_SIZE = 10;

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<{imported: number; failed: number; skipped?: number; skippedDetails?: {row: number; errors: string[]}[]} | null>(null);
  const [showSkippedDetails, setShowSkippedDetails] = useState(false);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const toggleRowExpand = (rowNum: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowNum)) {
        newSet.delete(rowNum);
      } else {
        newSet.add(rowNum);
      }
      return newSet;
    });
  };

  const handlePreview = async () => {
    if (!file) {
      setError("请选择CSV文件");
      return;
    }

    setLoading(true);
    setError("");
    setCurrentPage(1);

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

  // 分页计算
  const totalPages = preview ? Math.ceil(preview.rows.length / PAGE_SIZE) : 0;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, preview?.rows.length || 0);
  const currentRows = preview?.rows.slice(startIndex, endIndex) || [];

  // 页码范围
  const getPageRange = () => {
    const range: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) range.push(i);
        range.push("...");
        range.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1);
        range.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) range.push(i);
      } else {
        range.push(1);
        range.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) range.push(i);
        range.push("...");
        range.push(totalPages);
      }
    }
    return range;
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
        {/* 下载模板 - 精简布局 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-blue-800">下载模板</h2>
              <p className="text-blue-600 text-sm mt-0.5">
                请先下载CSV模板，按照模板格式填写数据
              </p>
            </div>
            <Link
              href="/admin/api/cards/template"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              下载CSV模板
            </Link>
          </div>
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
              {/* 文件上传区域 */}
              <div className="relative">
                <input
                  key={fileInputKey}
                  type="file"
                  id="csv-file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-blue-400 cursor-pointer transition-colors"
                >
                  {file ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <div className="text-slate-800 font-medium">{file.name}</div>
                      <div className="text-slate-500 text-sm">{(file.size / 1024).toFixed(1)} KB</div>
                      <div className="text-blue-600 text-sm mt-1">点击更换文件</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📁</div>
                      <div className="text-slate-600 font-medium">点击或拖拽上传CSV文件</div>
                      <div className="text-slate-400 text-sm mt-1">支持 .csv 格式</div>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handlePreview}
                  disabled={loading || !file}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {loading ? "处理中..." : "预览数据"}
                </button>
                {file && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setFileInputKey(prev => prev + 1);
                    }}
                    className="px-6 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    清除
                  </button>
                )}
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
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">行号</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">证书编号</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">正面</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">反面</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">商品名称</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">操作类型</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">验证状态</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">错误详情</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentRows.map((row) => (
                    <tr key={row.row} className={row.errors.length > 0 ? "bg-red-50" : ""}>
                      <td className="px-4 py-2 text-sm text-slate-800">{row.row}</td>
                      <td className="px-4 py-2 text-sm font-mono text-slate-800">{row.data?.certNo || "-"}</td>
                      <td className="px-4 py-2">
                        <ImagePreview src={row.data?.frontImageUrl || ""} alt="正面" />
                      </td>
                      <td className="px-4 py-2">
                        <ImagePreview src={row.data?.backImageUrl || ""} alt="反面" />
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-800">{row.data?.productName || "-"}</td>
                      <td className="px-4 py-2 text-sm">
                        {row.errors.length === 0 && (
                          row.exists ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                              更新
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              新增
                            </span>
                          )
                        )}
                        {row.errors.length > 0 && (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {row.errors.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            无效
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                            有效
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {row.errors.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {(expandedRows.has(row.row) ? row.errors : row.errors.slice(0, 2)).map((err, idx) => (
                              <span key={idx} className="text-red-600 text-xs">
                                • {err}
                              </span>
                            ))}
                            {row.errors.length > 2 && (
                              <button
                                onClick={() => toggleRowExpand(row.row)}
                                className="text-left text-xs text-blue-600 hover:text-blue-800 mt-1 cursor-pointer hover:underline transition-colors"
                              >
                                {expandedRows.has(row.row) ? "收起" : `+${row.errors.length - 2} 项错误，点击展开`}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600">
                  显示第 {startIndex + 1}-{endIndex} 条，共 {preview.rows.length} 条
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 hover:text-blue-600 hover:shadow-sm disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                  >
                    上一页
                  </button>
                  {getPageRange().map((page, idx) => (
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`min-w-8 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer border transition-all ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "text-slate-600 bg-white border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 hover:text-blue-600 hover:shadow-sm disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleImport}
                disabled={loading || preview.valid === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300"
              >
                {loading ? "导入中..." : `确认导入 (${preview.valid}条)`}
              </button>
              <button
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                  setFileInputKey(prev => prev + 1);
                  setCurrentPage(1);
                }}
                disabled={loading}
                className="px-6 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 disabled:bg-slate-100"
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

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-sm text-green-600">成功导入</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                <div className="text-sm text-red-600">导入失败</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-600">{importResult.skipped || 0}</div>
                <div className="text-sm text-amber-600">已跳过</div>
              </div>
            </div>

            {/* 查看跳过详情 */}
            {importResult.skipped && importResult.skipped > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowSkippedDetails(!showSkippedDetails)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {showSkippedDetails ? "收起详情" : "查看跳过详情"}
                </button>
                {showSkippedDetails && importResult.skippedDetails && (
                  <div className="mt-3 bg-slate-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <table className="min-w-full text-sm">
                      <thead className="text-xs text-slate-500 uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">行号</th>
                          <th className="px-3 py-2 text-left">错误原因</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {importResult.skippedDetails.map((item) => (
                          <tr key={item.row}>
                            <td className="px-3 py-2 text-slate-800">{item.row}</td>
                            <td className="px-3 py-2 text-red-600">
                              {item.errors.join("；")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

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
                  setCurrentPage(1);
                }}
                className="px-6 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50"
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
