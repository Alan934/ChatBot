-- AlterTable
ALTER TABLE "_flowsTopricing_plans" ADD CONSTRAINT "_flowsTopricing_plans_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_flowsTopricing_plans_AB_unique";

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "google" SET DEFAULT false;
