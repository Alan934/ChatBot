/*
  Warnings:

  - Added the required column `google` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "google" BOOLEAN NOT NULL;
