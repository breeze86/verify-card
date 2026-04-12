import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { currentPassword, newPassword } = body;

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "请填写当前密码和新密码" },
        { status: 400 }
      );
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "新密码至少需要6位" },
        { status: 400 }
      );
    }

    // 获取管理员完整信息（包含密码哈希）
    const adminWithPassword = await prisma.admin.findUnique({
      where: { id: admin.id },
    });

    if (!adminWithPassword) {
      return NextResponse.json(
        { error: "管理员不存在" },
        { status: 404 }
      );
    }

    // 验证当前密码
    const isValid = await bcrypt.compare(
      currentPassword,
      adminWithPassword.passwordHash
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "当前密码错误" },
        { status: 400 }
      );
    }

    // 生成新密码哈希
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newPasswordHash },
    });

    // 返回成功，并指示前端清除登录状态
    return NextResponse.json({ success: true, requireRelogin: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "修改密码失败" },
      { status: 500 }
    );
  }
}
