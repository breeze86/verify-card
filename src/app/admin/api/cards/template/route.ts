import { NextResponse } from "next/server";
import { stringify } from "csv-stringify/sync";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();

    const headers = [
      "cardNo",
      "certNo",
      "tagNo",
      "brand",
      "series",
      "productName",
      "issueYear",
      "language",
      "productNo",
      "grade",
      "frontImageUrl",
      "backImageUrl",
      "status",
      "batchNo",
      "validStart",
      "validEnd",
    ];

    const example = [
      "123456789012345",
      "CERT-2024-001",
      "TAG-001",
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
      "BATCH-001",
      "2024-01-01",
      "2025-12-31",
    ];

    const csv = stringify([headers, example]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=stg-astra-card-template.csv",
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
