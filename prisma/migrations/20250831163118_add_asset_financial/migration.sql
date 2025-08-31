/*
  Warnings:

  - Added the required column `price` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salvageValue` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usefulLife` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Asset` ADD COLUMN `price` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `salvageValue` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `usefulLife` INTEGER NOT NULL;
