import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cardNo = searchParams.get("cardNo");

  if (!cardNo) {
    return NextResponse.json(
      { error: "Card number is required" },
      { status: 400 }
    );
  }

  try {
    const card = await prisma.card.findUnique({
      where: { cardNo },
    });

    if (!card || card.deletedAt) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    if (card.status === "inactive") {
      return NextResponse.json(
        { error: "This card has been deactivated" },
        { status: 400 }
      );
    }

    if (card.status === "expired") {
      return NextResponse.json(
        { error: "This card has expired" },
        { status: 400 }
      );
    }

    if (card.validEnd && new Date() > card.validEnd) {
      return NextResponse.json(
        { error: "This card has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      certNo: card.certNo,
      tagNo: card.tagNo,
      brand: card.brand,
      series: card.series,
      productName: card.productName,
      issueYear: card.issueYear,
      language: card.language,
      productNo: card.productNo,
      grade: card.grade,
      frontImageUrl: card.frontImageUrl,
      backImageUrl: card.backImageUrl,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
