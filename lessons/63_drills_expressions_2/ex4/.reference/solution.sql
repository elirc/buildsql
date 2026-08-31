SELECT q.id, q.name, q.part1, q.part2
FROM (
  SELECT s.id, s.name,
         split_part(s.name, ' ', 1) AS part1,
         split_part(s.name, ' ', 2) AS part2
  FROM staff AS s
) AS q;
