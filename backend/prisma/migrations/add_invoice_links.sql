-- Add InvoiceLink table for Nebula-Pay
CREATE TABLE "InvoiceLink" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "sender" TEXT NOT NULL,
  "receiver" TEXT NOT NULL,
  "amount" TEXT NOT NULL,
  "tokenAddress" TEXT NOT NULL,
  "duration" INTEGER NOT NULL,
  "description" TEXT,
  "pdfUrl" TEXT,
  "xdrParams" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "InvoiceLink_slug_idx" ON "InvoiceLink"("slug");
CREATE INDEX "InvoiceLink_sender_idx" ON "InvoiceLink"("sender");
CREATE INDEX "InvoiceLink_status_idx" ON "InvoiceLink"("status");
CREATE INDEX "InvoiceLink_createdAt_idx" ON "InvoiceLink"("createdAt");
