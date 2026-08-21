SELECT count(*)
FROM events
WHERE ts >= '2023-11-13 08:00+00'
  AND ts < '2023-11-13 10:00+00';
