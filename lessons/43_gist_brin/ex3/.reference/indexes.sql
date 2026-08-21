CREATE INDEX events_ts_brin32_idx ON events USING brin (ts) WITH (pages_per_range = 32);
