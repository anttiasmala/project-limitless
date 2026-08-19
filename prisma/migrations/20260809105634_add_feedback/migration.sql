-- CreateEnum
CREATE TYPE "feedback_type" AS ENUM ('BUG', 'IDEA', 'OTHER');

-- CreateEnum
CREATE TYPE "feedback_status" AS ENUM ('NEW', 'READ', 'RESOLVED');

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "feedback_type" NOT NULL DEFAULT 'OTHER',
    "status" "feedback_status" NOT NULL DEFAULT 'NEW',
    "pageUrl" TEXT,
    "email" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedback_userId_idx" ON "feedback"("userId");

-- CreateIndex
CREATE INDEX "feedback_createdAt_idx" ON "feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
