CREATE INDEX events_ts_btree_idx ON events (ts);
CREATE INDEX events_ts_brin_idx  ON events USING brin (ts);
