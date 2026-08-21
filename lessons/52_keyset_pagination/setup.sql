-- The indexes this lesson's tables already have in production, applied by the
-- gate (and by `dojo plan`) before anything is measured. The feed index is
-- what makes ex1 and ex3 a fair fight: the naive OFFSET query is timed with
-- exactly the index your rewrite gets. In ex4 it is there to be useless.
CREATE INDEX events_ts_id_idx ON events (ts, id);
