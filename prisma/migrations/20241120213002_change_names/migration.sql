/*
  Warnings:

  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enterprise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Flow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PricingPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FlowToPricingPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_enterpriseId_fkey";

-- DropForeignKey
ALTER TABLE "Enterprise" DROP CONSTRAINT "Enterprise_pricingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_enterpriseId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_flowId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_parentMessageId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_enterpriseId_fkey";

-- DropForeignKey
ALTER TABLE "_FlowToPricingPlan" DROP CONSTRAINT "_FlowToPricingPlan_A_fkey";

-- DropForeignKey
ALTER TABLE "_FlowToPricingPlan" DROP CONSTRAINT "_FlowToPricingPlan_B_fkey";

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Enterprise";

-- DropTable
DROP TABLE "Flow";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "PricingPlan";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "_FlowToPricingPlan";

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) DEFAULT '9999-12-12 00:00:00 +00:00',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Rol" NOT NULL,
    "enterpriseId" TEXT NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) DEFAULT '9999-12-12 00:00:00 +00:00',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "username" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprises" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) DEFAULT '9999-12-12 00:00:00 +00:00',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL,
    "pricingPlanId" TEXT NOT NULL,

    CONSTRAINT "enterprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flows" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) DEFAULT '9999-12-12 00:00:00 +00:00',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) DEFAULT '9999-12-12 00:00:00 +00:00',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "numOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "option" "Option" NOT NULL,
    "typeMessage" "TypeMessage" NOT NULL,
    "showName" BOOLEAN NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "parentMessageId" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) DEFAULT '9999-12-12 00:00:00 +00:00',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_flowsTopricing_plans" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_flowsTopricing_plans_AB_unique" ON "_flowsTopricing_plans"("A", "B");

-- CreateIndex
CREATE INDEX "_flowsTopricing_plans_B_index" ON "_flowsTopricing_plans"("B");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprises" ADD CONSTRAINT "enterprises_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "pricing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "flows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_flowsTopricing_plans" ADD CONSTRAINT "_flowsTopricing_plans_A_fkey" FOREIGN KEY ("A") REFERENCES "flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_flowsTopricing_plans" ADD CONSTRAINT "_flowsTopricing_plans_B_fkey" FOREIGN KEY ("B") REFERENCES "pricing_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
