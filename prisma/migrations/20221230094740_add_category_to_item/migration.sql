/*
  Warnings:

  - Added the required column `category` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Item` ADD COLUMN `category` VARCHAR(191) NOT NULL;
