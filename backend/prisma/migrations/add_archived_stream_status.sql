-- Migration: add ARCHIVED value to StreamStatus enum
-- Used to mark V1 streams that have been successfully migrated to V2,
-- preventing them from appearing as active entries in the UI.

ALTER TYPE "StreamStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';
