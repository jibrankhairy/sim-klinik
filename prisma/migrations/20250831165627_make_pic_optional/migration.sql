-- DropForeignKey
ALTER TABLE `Asset` DROP FOREIGN KEY `Asset_picId_fkey`;

-- DropIndex
DROP INDEX `Asset_picId_fkey` ON `Asset`;

-- AlterTable
ALTER TABLE `Asset` MODIFY `picId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_picId_fkey` FOREIGN KEY (`picId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
