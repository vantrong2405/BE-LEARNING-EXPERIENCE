/*
  Warnings:

  - The `verify` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status_account` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "status",
ADD COLUMN     "status" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "verify",
ADD COLUMN     "verify" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status_account",
ADD COLUMN     "status_account" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "StatusAccount";

-- DropEnum
DROP TYPE "Verify";
