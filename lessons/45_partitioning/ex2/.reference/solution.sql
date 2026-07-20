SELECT count(*)
FROM events_p
WHERE ts >= '2023-11-01'
  AND ts < '2023-11-08';
