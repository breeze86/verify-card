-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('active', 'inactive', 'expired');

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'active',
    "certNo" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "productName" VARCHAR(200) NOT NULL,
    "issueYear" INTEGER NOT NULL,
    "language" VARCHAR(50) NOT NULL,
    "productNo" VARCHAR(100) NOT NULL,
    "grade" VARCHAR(50) NOT NULL,
    "frontImageUrl" VARCHAR(500) NOT NULL,
    "backImageUrl" VARCHAR(500) NOT NULL,
    "batchNo" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cards_certNo_key" ON "cards"("certNo");

-- CreateIndex
CREATE INDEX "cards_certNo_idx" ON "cards"("certNo");

-- CreateIndex
CREATE INDEX "cards_status_idx" ON "cards"("status");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
