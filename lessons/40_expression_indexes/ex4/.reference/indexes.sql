CREATE INDEX events_payload_value_idx ON events (((payload ->> 'value')::int));
