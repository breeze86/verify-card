import { prisma } from "@/lib/prisma";

/**
 * 生成新的批次号
 * 从 100000 开始，自动递增
 * 每次调用生成一个新的批次号
 */
export async function generateBatchNo(): Promise<string> {
  // 查找当前最大的批次号
  const result = await prisma.card.findFirst({
    where: {
      batchNo: {
        not: null,
      },
    },
    orderBy: {
      batchNo: 'desc',
    },
    select: {
      batchNo: true,
    },
  });

  let nextBatchNo = 100000;

  if (result?.batchNo) {
    // 尝试解析现有的批次号为数字
    const currentNum = parseInt(result.batchNo, 10);
    if (!isNaN(currentNum) && currentNum >= 100000) {
      nextBatchNo = currentNum + 1;
    }
  }

  return String(nextBatchNo);
}
