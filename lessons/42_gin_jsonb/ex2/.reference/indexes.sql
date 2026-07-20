CREATE INDEX events_payload_idx
  ON events USING gin (payload jsonb_path_ops);
