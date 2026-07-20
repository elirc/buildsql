SELECT id, (payload ->> 'value')::int FROM events
WHERE event_type = 'purchase' AND (payload ->> 'value')::int > 995;
