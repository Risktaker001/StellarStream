-- Create table for indexed DAO governance proposals
CREATE TABLE IF NOT EXISTS "Proposal" (
  "id" TEXT NOT NULL,
  "creator" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quorum" INTEGER NOT NULL,
  "votesFor" INTEGER NOT NULL DEFAULT 0,
  "votesAgainst" INTEGER NOT NULL DEFAULT 0,
  "txHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Proposal_txHash_key" ON "Proposal"("txHash");
CREATE INDEX IF NOT EXISTS "Proposal_creator_idx" ON "Proposal"("creator");
CREATE INDEX IF NOT EXISTS "Proposal_createdAt_idx" ON "Proposal"("createdAt");
