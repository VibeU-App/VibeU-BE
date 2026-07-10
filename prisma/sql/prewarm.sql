-- Prewarm frequently accessed tables into shared_buffers
-- This reduces cold-start latency for queries
SELECT pg_prewarm(quote_ident('users')) as users,
       pg_prewarm(quote_ident('account_statuses')) as account_statuses,
       pg_prewarm(quote_ident('sessions')) as sessions;
