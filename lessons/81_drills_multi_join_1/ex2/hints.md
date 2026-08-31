## Hint 1
Aggregate first, sort second, cut third. The `LIMIT` applies to the grouped result, not to the rows going into it.

## Hint 2
Join the three tables, `GROUP BY p.id, p.name`, then `ORDER BY units DESC, p.id LIMIT 10`. The tie-break on `p.id` is not decoration - without it, two products on identical unit counts can swap places between runs and the tenth row becomes a coin toss.
