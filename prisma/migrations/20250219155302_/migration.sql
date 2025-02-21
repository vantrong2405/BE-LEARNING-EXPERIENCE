/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifyToken` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `forgotPasswordToken` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Users` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Course_Detail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Lessons` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Users_emailVerifyToken_key";

-- DropIndex
DROP INDEX "Users_forgotPasswordToken_key";

-- AlterTable
ALTER TABLE "Course_Detail" ADD COLUMN     "learningObjectives" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Courses" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "level" TEXT NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Lessons" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Refresh_Tokens" ADD COLUMN     "initAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "emailVerified",
DROP COLUMN "emailVerifyToken",
DROP COLUMN "forgotPasswordToken",
DROP COLUMN "isActive",
ADD COLUMN     "email_verify_token" TEXT,
ADD COLUMN     "expertise" TEXT,
ADD COLUMN     "forgot_password_token" TEXT,
ADD COLUMN     "instructorBio" TEXT,
ADD COLUMN     "instructorStatus" TEXT,
ADD COLUMN     "isInstructor" BOOLEAN NOT NULL DEFAULT false;
