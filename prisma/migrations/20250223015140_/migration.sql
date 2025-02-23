/*
  Warnings:

  - You are about to drop the column `courseId` on the `Upload` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_courseId_fkey";

-- AlterTable
ALTER TABLE "Upload" DROP COLUMN "courseId";
