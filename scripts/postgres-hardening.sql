-- =============================================================================
-- PostgreSQL Hardening — StellarStream / Warp Indexer
-- Issue #516 — Security Critical
--
-- Run as superuser:
--   sudo -u postgres psql -f postgres-hardening.sql
-- =============================================================================

-- 1. Revoke superuser privileges from the app user
--    Replace 'warp' with your actual DB_USER if different
ALTER ROLE warp NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;

-- 2. Ensure the app user only has access to its own database
REVOKE ALL ON DATABASE postgres   FROM warp;
REVOKE ALL ON DATABASE template1  FROM warp;

-- 3. Lock down the postgres superuser with a strong password
--    (replace <STRONG_PASSWORD> with a generated secret — store in .env / secrets manager)
-- ALTER USER postgres WITH PASSWORD '<STRONG_PASSWORD>';

-- 4. Revoke public schema create from PUBLIC (PostgreSQL 14 default changed this,
--    but explicit is safer)
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- 5. Grant only what the app needs on its own database
--    (run connected to the app database, e.g. \c warpdb)
-- GRANT CONNECT ON DATABASE warpdb TO warp;
-- GRANT USAGE  ON SCHEMA public   TO warp;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO warp;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO warp;

-- 6. Verify: no roles with unnecessary superuser
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole
FROM   pg_roles
WHERE  rolsuper = true
ORDER  BY rolname;
