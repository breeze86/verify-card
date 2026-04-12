import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { generateBatchNo } from "@/lib/batch-no";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      certNo,
      brand,
      series,
      productName,
      issueYear,
      language,
      productNo,
      grade,
      frontImageUrl,
      backImageUrl,
      status,
    } = body;

    // 自动生成批次号
    const batchNo = await generateBatchNo();

    // 验证必填字段
    if (!certNo || !brand || !series || !productName || !issueYear || !language || !productNo || !grade || !frontImageUrl || !backImageUrl) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 检查证书编号是否已存在
    const existing = await prisma.card.findUnique({
      where: { certNo },
    });

    if (existing) {
      return NextResponse.json(
        { error: "证书编号已存在" },
        { status: 400 }
      );
    }

    const card = await prisma.card.create({
      data: {
        certNo,
        brand,
        series,
        productName,
        issueYear,
        language,
        productNo,
        grade,
        frontImageUrl,
        backImageUrl,
        status: status || "active",
        batchNo,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Create card error:", error);
    return NextResponse.json(
      { error: "创建失败" },
      { status: 500 }
    );
  }
}
