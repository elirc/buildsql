CREATE INDEX events_payload_pathops_idx ON events USING gin (payload jsonb_path_ops);
