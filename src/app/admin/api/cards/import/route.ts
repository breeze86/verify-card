import { NextRequest, NextResponse } from "next/server";
import { parse } from "papaparse";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { generateBatchNo } from "@/lib/batch-no";

// CSV 中文表头到英文字段名的映射
const CSV_HEADER_MAP: Record<string, keyof CardData> = {
  "证书编号": "certNo",
  "商品品牌": "brand",
  "商品名称": "productName",
  "发行年份": "issueYear",
  "语言": "language",
  "商品编号": "productNo",
  "评分": "grade",
  "正面照片链接": "frontImageUrl",
  "背面照片链接": "backImageUrl",
  "状态": "status",
};

// 内部统一使用英文字段名
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
}

interface PreviewResult {
  row: number;
  data: CardData;
  errors: string[];
  exists: boolean;
}

// 将中文表头的 CSV 行转换为英文字段名
function convertCsvRow(row: Record<string, string>): CardData {
  const result: Partial<CardData> = {};
  for (const [rawKey, value] of Object.entries(row)) {
    // 去除 BOM 和空白字符
    const cnKey = rawKey.replace(/^\uFEFF/, "").trim();
    const enKey = CSV_HEADER_MAP[cnKey];
    if (enKey) {
      result[enKey] = value;
    }
  }
  return result as CardData;
}

// 验证必填字段
function validateRow(row: CardData): string[] {
  const errors: string[] = [];
  if (!row.certNo?.trim()) errors.push("证书编号不能为空");
  if (!row.brand?.trim()) errors.push("商品品牌不能为空");
  if (!row.productName?.trim()) errors.push("商品名称不能为空");
  if (!row.issueYear?.trim()) errors.push("发行年份不能为空");
  if (!row.language?.trim()) errors.push("语言不能为空");
  if (!row.productNo?.trim()) errors.push("商品编号不能为空");
  if (!row.grade?.trim()) errors.push("评分不能为空");
  if (!row.frontImageUrl?.trim()) errors.push("正面照片链接不能为空");
  if (!row.backImageUrl?.trim()) errors.push("背面照片链接不能为空");
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const action = formData.get("action") as string;

    if (!file) {
      return NextResponse.json({ error: "请上传CSV文件" }, { status: 400 });
    }

    const text = await file.text();
    const result = parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      return NextResponse.json(
        { error: "CSV解析失败", details: result.errors },
        { status: 400 }
      );
    }

    // 转换为英文字段名并过滤空行
    const rows = result.data
      .map(convertCsvRow)
      .filter((row) => Object.values(row).some((val) => val?.trim()));

    const preview: PreviewResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors = validateRow(row);

      // 检查证书编号是否已存在
      let exists = false;
      if (row.certNo?.trim()) {
        const existing = await prisma.card.findUnique({
          where: { certNo: row.certNo.trim() },
        });
        exists = !!existing;
      }

      preview.push({
        row: i + 1, // 从1开始计数
        data: row,
        errors,
        exists,
      });
    }

    if (action === "preview") {
      return NextResponse.json({
        total: rows.length,
        valid: preview.filter((p) => p.errors.length === 0).length,
        invalid: preview.filter((p) => p.errors.length > 0).length,
        new: preview.filter((p) => !p.exists && p.errors.length === 0).length,
        update: preview.filter((p) => p.exists && p.errors.length === 0).length,
        rows: preview,
      });
    }

    // 执行导入
    const validRows = preview.filter((p) => p.errors.length === 0);
    const invalidRows = preview.filter((p) => p.errors.length > 0);
    const imported = [];
    const failed = [];

    // 批量导入时，所有记录使用同一个批次号
    const batchNo = await generateBatchNo();

    for (const item of validRows) {
      try {
        const row = item.data;
        const card = await prisma.card.upsert({
          where: { certNo: row.certNo!.trim() },
          update: {
            brand: row.brand!.trim(),
            productName: row.productName!.trim(),
            issueYear: parseInt(row.issueYear!.trim(), 10),
            language: row.language!.trim(),
            productNo: row.productNo!.trim(),
            grade: row.grade!.trim(),
            frontImageUrl: row.frontImageUrl!.trim(),
            backImageUrl: row.backImageUrl!.trim(),
            status: (row.status as "active" | "inactive" | "expired") || "active",
            batchNo,
            deletedAt: null,
          },
          create: {
            certNo: row.certNo!.trim(),
            brand: row.brand!.trim(),
            productName: row.productName!.trim(),
            issueYear: parseInt(row.issueYear!.trim(), 10),
            language: row.language!.trim(),
            productNo: row.productNo!.trim(),
            grade: row.grade!.trim(),
            frontImageUrl: row.frontImageUrl!.trim(),
            backImageUrl: row.backImageUrl!.trim(),
            status: (row.status as "active" | "inactive" | "expired") || "active",
            batchNo,
          },
        });
        imported.push({ row: item.row, certNo: card.certNo });
      } catch (error) {
        failed.push({ row: item.row, error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      failed: failed.length,
      skipped: invalidRows.length,
      skippedDetails: invalidRows.map((r) => ({ row: r.row, errors: r.errors })),
      details: { imported, failed },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Import error:", error);
    return NextResponse.json({ error: "导入失败" }, { status: 500 });
  }
}
