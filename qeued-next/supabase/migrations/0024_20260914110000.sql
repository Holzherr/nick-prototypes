-- Takes the nightly slate refresh off the schedule.
--
-- The overnight job was the only thing in the database that spent model tokens, and it spent
-- them on every profile with a list whether or not anyone was going to look. A visit is the
-- better trigger: the app now asks for a refresh when someone opens their recommendations and
-- the slate they were served came from saved data alone. The request is never awaited — the
-- page still renders in 0s from what is already held, and the new slate arrives behind a
-- button rather than replacing what the viewer is reading.
--
-- invoke_function() and refresh_recommendation_slates() stay. Nothing calls them on a
-- schedule any more, but they are how a slate gets rebuilt by hand from the SQL editor, and
-- tools/refresh-slates.mjs does the same job from a laptop.

DO $$
BEGIN
  PERFORM cron.unschedule('qeued-refresh-slates');
EXCEPTION
  WHEN OTHERS THEN RAISE NOTICE 'qeued-refresh-slates was not scheduled';
END;
$$;
