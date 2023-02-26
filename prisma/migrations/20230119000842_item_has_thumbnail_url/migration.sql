/*
  Warnings:

  - Added the required column `thumbnailFileName` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Item` ADD COLUMN `thumbnailFileName` VARCHAR(191) NOT NULL;
