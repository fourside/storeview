/*
  Warnings:

  - You are about to drop the `Read` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Read`;

-- CreateTable
CREATE TABLE `NotReadCount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `count` INTEGER NOT NULL,
    `lastReadAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
