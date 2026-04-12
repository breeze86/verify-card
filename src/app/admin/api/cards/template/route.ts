import { NextResponse } from "next/server";
import { stringify } from "csv-stringify/sync";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();

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

    const example = [
      "CERT-2024-001",
      "Pokémon",
      "Scarlet & Violet",
      "Charizard EX",
      "2023",
      "English",
      "SV-001",
      "PSA 10",
      "https://example.com/front.jpg",
      "https://example.com/back.jpg",
      "active",
    ];

    const csv = stringify([headers, example]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=card-import-template.csv",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Template error:", error);
    return NextResponse.json({ error: "生成模板失败" }, { status: 500 });
  }
}
