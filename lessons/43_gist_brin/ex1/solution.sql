SELECT count(*)
FROM events
WHERE ts >= '2023-11-14 00:00+00'
  AND ts < '2023-11-14 01:00+00';
