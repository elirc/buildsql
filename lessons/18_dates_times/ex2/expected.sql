SELECT gs::date FROM generate_series('2023-10-15'::date,
  '2023-11-13'::date, interval '1 day') gs
WHERE NOT EXISTS (SELECT 1 FROM events e
  WHERE e.customer_id = 4242 AND e.ts::date = gs::date)
ORDER BY 1;
