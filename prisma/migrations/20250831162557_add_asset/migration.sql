-- CreateTable
CREATE TABLE `Asset` (
    `id` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `status` ENUM('BAIK', 'RUSAK', 'PERBAIKAN') NOT NULL DEFAULT 'BAIK',
    `purchaseDate` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `assetType` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NOT NULL,
    `picId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Asset_barcode_key`(`barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_picId_fkey` FOREIGN KEY (`picId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
