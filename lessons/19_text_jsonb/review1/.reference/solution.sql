SELECT id, (payload ->> 'value')::int AS value
FROM events
WHERE event_type = 'purchase'
  AND (payload ->> 'value')::int > 995;
