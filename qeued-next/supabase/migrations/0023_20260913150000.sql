-- Lets several fetch loops work the queue at once without taking the same batch.
--
-- A wave takes the two hundred most-wanted pending candidates, reads their pages, and marks
-- them held. Between the taking and the marking there is a window of several minutes in
-- which a second loop asking the same question gets the same two hundred rows, so running
-- two loops doubled the work and not the throughput. The queue was the reason scraping could
-- only go as fast as one loop.
--
-- A claim is a lease rather than a lock: a row taken is stamped, and a stamp older than the
-- expiry is ignored. A loop that dies mid-wave therefore costs nothing beyond the wait —
-- nothing has to notice it died, and the rows return to the queue on their own.

ALTER TABLE public.catalogue_candidates
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.catalogue_candidates.claimed_at IS
  'When a fetch loop took this row. Ignored once older than the lease, so a dead loop frees its batch by itself.';

-- The queue index has to know about claims or every loop still scans the same head of the
-- queue and then discards it.
DROP INDEX IF EXISTS idx_candidates_queue;
CREATE INDEX IF NOT EXISTS idx_candidates_queue
  ON public.catalogue_candidates (priority DESC, attempts, created_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_candidates_claimed
  ON public.catalogue_candidates (claimed_at)
  WHERE status = 'pending';

/**
 * Takes the next batch and claims it in one statement.
 *
 * One statement matters: select-then-update leaves the same gap this is meant to close.
 * FOR UPDATE SKIP LOCKED handles two loops landing in the same millisecond; the lease
 * handles the minutes afterwards.
 */
CREATE OR REPLACE FUNCTION public.claim_candidates(p_count INTEGER, p_lease INTERVAL DEFAULT '30 minutes')
RETURNS TABLE (name TEXT, year INTEGER, type TEXT, source_url TEXT)
LANGUAGE sql AS $$
  UPDATE public.catalogue_candidates c
  SET claimed_at = now(), attempts = c.attempts + 1, updated_at = now()
  WHERE c.id IN (
    SELECT q.id FROM public.catalogue_candidates q
    WHERE q.status = 'pending'
      AND (q.claimed_at IS NULL OR q.claimed_at < now() - p_lease)
    ORDER BY q.priority DESC, q.attempts, q.created_at
    LIMIT p_count
    FOR UPDATE SKIP LOCKED
  )
  RETURNING c.name, c.year, c.type, c.source_url;
$$;

REVOKE ALL ON FUNCTION public.claim_candidates(INTEGER, INTERVAL) FROM public, anon, authenticated;
