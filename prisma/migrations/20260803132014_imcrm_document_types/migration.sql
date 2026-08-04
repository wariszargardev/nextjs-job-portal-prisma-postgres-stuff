-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "quoteTypeId" INTEGER,
    "folderPath" TEXT,
    "acceptedFiles" TEXT,
    "maxFiles" INTEGER NOT NULL DEFAULT 1,
    "maxSize" INTEGER NOT NULL DEFAULT 5,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sendToCustomer" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "receiveFromCustomer" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'QUOTE',
    "isRequiredForSendPolicy" BOOLEAN NOT NULL DEFAULT false,
    "businessTypeOfInsuranceId" BIGINT,
    "businessTypeOfCustomer" TEXT,
    "toolTip" TEXT,
    "registrationType" TEXT,
    "vehicleUse" TEXT,
    "isRestrictedInternalDocument" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteType" (
    "id" SERIAL NOT NULL,
    "shortCode" TEXT,
    "code" TEXT,
    "text" TEXT,
    "textAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_code_key" ON "DocumentType"("code");

-- CreateIndex
CREATE INDEX "DocumentType_isActive_idx" ON "DocumentType"("isActive");

-- CreateIndex
CREATE INDEX "DocumentType_quoteTypeId_idx" ON "DocumentType"("quoteTypeId");

-- CreateIndex
CREATE INDEX "QuoteType_isActive_idx" ON "QuoteType"("isActive");

-- AddForeignKey
ALTER TABLE "DocumentType" ADD CONSTRAINT "DocumentType_quoteTypeId_fkey" FOREIGN KEY ("quoteTypeId") REFERENCES "QuoteType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
