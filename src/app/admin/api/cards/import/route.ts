import { NextRequest, NextResponse } from "next/server";
import { parse } from "papaparse";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

interface CsvRow {
  cardNo?: string;
  certNo?: string;
  tagNo?: string;
  brand?: string;
  series?: string;
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

interface PreviewResult {
  row: number;
  data: CsvRow;
  errors: string[];
  exists: boolean;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const action = formData.get("action") as string; // 'preview' or 'import'

    if (!file) {
      return NextResponse.json({ error: "请上传CSV文件" }, { status: 400 });
    }

    const text = await file.text();
    const result = parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      return NextResponse.json(
        { error: "CSV解析失败", details: result.errors },
        { status: 400 }
      );
    }

    const rows = result.data;
    const preview: PreviewResult[] = [];

    // 验证每一行
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];

      // 必填字段验证
      if (!row.cardNo) errors.push("卡号不能为空");
      if (!row.certNo) errors.push("证书编号不能为空");
      if (!row.tagNo) errors.push("标签号不能为空");
      if (!row.brand) errors.push("商品品牌不能为空");
      if (!row.series) errors.push("商品系列不能为空");
      if (!row.productName) errors.push("商品名称不能为空");
      if (!row.issueYear) errors.push("发行年份不能为空");
      if (!row.language) errors.push("语言不能为空");
      if (!row.productNo) errors.push("商品编号不能为空");
      if (!row.grade) errors.push("评分不能为空");
      if (!row.frontImageUrl) errors.push("正面照片链接不能为空");
      if (!row.backImageUrl) errors.push("背面照片链接不能为空");

      // 检查卡号是否已存在
      let exists = false;
      if (row.cardNo) {
        const existing = await prisma.card.findUnique({
          where: { cardNo: row.cardNo },
        });
        exists = !!existing;
      }

      preview.push({
        row: i + 2, // CSV行号从1开始，第1行是表头
        data: row,
        errors,
        exists,
      });
    }

    // 如果只是预览，返回预览数据
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
    const imported = [];
    const failed = [];

    for (const item of validRows) {
      try {
        const row = item.data;
        const card = await prisma.card.upsert({
          where: { cardNo: row.cardNo! },
          update: {
            certNo: row.certNo!,
            tagNo: row.tagNo!,
            brand: row.brand!,
            series: row.series!,
            productName: row.productName!,
            issueYear: parseInt(row.issueYear!, 10),
            language: row.language!,
            productNo: row.productNo!,
            grade: row.grade!,
            frontImageUrl: row.frontImageUrl!,
            backImageUrl: row.backImageUrl!,
            status: (row.status as 'active' | 'inactive' | 'expired') || "active",
            batchNo: row.batchNo || null,
            validStart: row.validStart ? new Date(row.validStart) : null,
            validEnd: row.validEnd ? new Date(row.validEnd) : null,
            deletedAt: null, // 恢复已删除的
          },
          create: {
            cardNo: row.cardNo!,
            certNo: row.certNo!,
            tagNo: row.tagNo!,
            brand: row.brand!,
            series: row.series!,
            productName: row.productName!,
            issueYear: parseInt(row.issueYear!, 10),
            language: row.language!,
            productNo: row.productNo!,
            grade: row.grade!,
            frontImageUrl: row.frontImageUrl!,
            backImageUrl: row.backImageUrl!,
            status: (row.status as 'active' | 'inactive' | 'expired') || "active",
            batchNo: row.batchNo || null,
            validStart: row.validStart ? new Date(row.validStart) : null,
            validEnd: row.validEnd ? new Date(row.validEnd) : null,
          },
        });
        imported.push({ row: item.row, cardNo: card.cardNo });
      } catch (error) {
        failed.push({ row: item.row, error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      failed: failed.length,
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
