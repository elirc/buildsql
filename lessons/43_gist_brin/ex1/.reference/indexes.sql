CREATE INDEX events_ts_brin_idx ON events USING brin (ts);
