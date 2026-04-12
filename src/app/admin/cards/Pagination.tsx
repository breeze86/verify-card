"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  search,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageSizeChange = (newSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", newSize);
    params.set("page", "1"); // 切换每页数量时重置到第一页
    router.push(`/admin/cards?${params.toString()}`);
  };

  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());
    return `/admin/cards?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg mt-6">
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-600">
          显示第 {total > 0 ? (page - 1) * pageSize + 1 : 0}-
          {Math.min(page * pageSize, total)} 条，共 {total} 条
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">每页</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900 bg-white"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}条
              </option>
            ))}
          </select>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Link
            href={getPageUrl(page - 1)}
            className={`px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all ${
              page === 1 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            上一页
          </Link>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            return (
              <Link
                key={pageNum}
                href={getPageUrl(pageNum)}
                className={`min-w-8 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                  page === pageNum
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "text-slate-600 bg-white border-slate-200 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
          <Link
            href={getPageUrl(page + 1)}
            className={`px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all ${
              page === totalPages ? "pointer-events-none opacity-50" : ""
            }`}
          >
            下一页
          </Link>
        </div>
      )}
    </div>
  );
}
