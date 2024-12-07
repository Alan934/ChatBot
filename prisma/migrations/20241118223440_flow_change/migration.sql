/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `Flow` table. All the data in the column will be lost.
  - Made the column `available` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `available` on table `Enterprise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `available` on table `Flow` required. This step will fail if there are existing NULL values in that column.
  - Made the column `available` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `available` on table `PricingPlan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `available` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "available" SET NOT NULL;

-- AlterTable
ALTER TABLE "Enterprise" ALTER COLUMN "available" SET NOT NULL;

-- AlterTable
ALTER TABLE "Flow" DROP COLUMN "isDeleted",
ALTER COLUMN "available" SET NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "available" SET NOT NULL;

-- AlterTable
ALTER TABLE "PricingPlan" ALTER COLUMN "available" SET NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "available" SET NOT NULL;
