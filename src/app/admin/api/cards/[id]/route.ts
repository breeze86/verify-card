import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const card = await prisma.card.findUnique({
      where: { id },
    });

    if (!card || card.deletedAt) {
      return NextResponse.json(
        { error: "卡片不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(card);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Get card error:", error);
    return NextResponse.json(
      { error: "获取失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const {
      certNo,
      brand,
      productName,
      issueYear,
      language,
      productNo,
      grade,
      frontImageUrl,
      backImageUrl,
      status,
      batchNo,
    } = body;

    // 验证必填字段
    if (!certNo || !brand || !productName || !issueYear || !language || !productNo || !grade || !frontImageUrl || !backImageUrl) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 检查证书编号是否被其他卡片使用
    const existing = await prisma.card.findFirst({
      where: {
        certNo,
        id: { not: id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "证书编号已被其他卡片使用" },
        { status: 400 }
      );
    }

    const card = await prisma.card.update({
      where: { id },
      data: {
        certNo,
        brand,
        productName,
        issueYear,
        language,
        productNo,
        grade,
        frontImageUrl,
        backImageUrl,
        status: status || "active",
        batchNo: batchNo || null,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Update card error:", error);
    return NextResponse.json(
      { error: "更新失败" },
      { status: 500 }
    );
  }
}
