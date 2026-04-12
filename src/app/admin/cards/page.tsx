import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import LogoutButton from "./LogoutButton";
import DeleteButton from "./DeleteButton";
import Pagination from "./Pagination";
import ImagePreview from "../components/ImagePreview";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; pageSize?: string }>;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default async function CardsPage({ searchParams }: PageProps) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const pageSize = parseInt(params.pageSize || "10", 10);

  const where = search
    ? {
        deletedAt: null as null | Date,
        OR: [
          { certNo: { contains: search } },
          { productName: { contains: search } },
        ],
      }
    : { deletedAt: null as null | Date };

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.card.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">卡片管理</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/password"
              className="text-slate-500 text-sm hover:text-slate-700"
            >
              修改密码
            </Link>
            <span className="text-slate-500 text-sm">{admin.username}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Link
            href="/admin/cards/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新增卡片
          </Link>
          <Link
            href="/admin/cards/import"
            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📁 批量导入
          </Link>
          <a
            href={`/admin/api/cards/export${search ? `?search=${search}` : ""}`}
            className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            📤 导出记录
          </a>

          <form className="flex-1 sm:max-w-md sm:ml-auto">
            <div className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="搜索证书编号、商品名称"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                搜索
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  证书编号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  正面
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  反面
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  商品名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  评分
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {cards.map((card: typeof cards[0]) => (
                <tr key={card.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900">
                    {card.certNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ImagePreview src={card.frontImageUrl} alt="正面" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ImagePreview src={card.backImageUrl} alt="反面" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {card.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-600">
                    {card.grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        card.status === "active"
                          ? "bg-green-100 text-green-800"
                          : card.status === "expired"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {card.status === "active"
                        ? "有效"
                        : card.status === "expired"
                        ? "已过期"
                        : "无效"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/cards/${card.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      编辑
                    </Link>
                    <DeleteButton cardId={card.id} />
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    暂无卡片数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          search={search}
        />
      </main>
    </div>
  );
}
