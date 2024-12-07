/*
  Warnings:

  - Made the column `password` on table `profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "password" SET NOT NULL;
