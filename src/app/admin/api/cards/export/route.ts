import { NextRequest, NextResponse } from "next/server";
import { stringify } from "csv-stringify/sync";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          deletedAt: null as null | Date,
          OR: [
            { certNo: { contains: search } },
            { productName: { contains: search } },
          ],
        }
      : { deletedAt: null as null | Date };

    // 查询所有符合条件的记录（不分页）
    const cards = await prisma.card.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // CSV 表头（与导入模板一致）
    const headers = [
      "证书编号",
      "商品品牌",
      "商品系列",
      "商品名称",
      "发行年份",
      "语言",
      "商品编号",
      "评分",
      "正面照片链接",
      "背面照片链接",
      "状态",
    ];

    // 转换数据为 CSV 行
    const rows = cards.map((card) => [
      card.certNo,
      card.brand,
      card.series,
      card.productName,
      card.issueYear.toString(),
      card.language,
      card.productNo,
      card.grade,
      card.frontImageUrl,
      card.backImageUrl,
      card.status,
    ]);

    const csv = stringify([headers, ...rows]);

    // 生成文件名（包含日期时间）
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const filename = `cards-export-${dateStr}-${timeStr}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Export error:", error);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }
}
