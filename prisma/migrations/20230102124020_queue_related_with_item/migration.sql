/*
  Warnings:

  - A unique constraint covering the columns `[itemId]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Queue` ADD COLUMN `itemId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Queue_itemId_key` ON `Queue`(`itemId`);

-- AddForeignKey
ALTER TABLE `Queue` ADD CONSTRAINT `Queue_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
