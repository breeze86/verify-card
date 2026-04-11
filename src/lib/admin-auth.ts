import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("admin_session")?.value;

  if (!sessionId) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: sessionId },
  });

  return admin;
}

export async function requireAdmin() {
  const admin = await getAdminSession();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  return admin;
}
