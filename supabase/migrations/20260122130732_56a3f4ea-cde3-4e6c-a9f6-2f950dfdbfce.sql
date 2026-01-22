create schema if not exists extensions;

-- Recreate pg_net in extensions schema (it does not support ALTER EXTENSION ... SET SCHEMA)
drop extension if exists pg_net cascade;
create extension if not exists pg_net with schema extensions;