## Hint 1
One page is ex2's query. Three pages is that query three times, each one
starting where the last one stopped — so the only new problem is getting the
cursor out of a page you just computed. A CTE holds a page; a second CTE
picks the cursor row out of it; the next page's `WHERE` reads that cursor.

## Hint 2
In a descending feed the last row of a page is its *smallest* `(rating, id)`
pair, so the cursor CTE sorts the page the other way and takes one row:

```sql
), cursor1 AS (
    SELECT rating, id FROM page1 ORDER BY rating, id LIMIT 1
), page2 AS (
    SELECT r.id, r.rating
    FROM reviews r, cursor1 c
    WHERE (r.rating, r.id) < (c.rating, c.id)
    ORDER BY r.rating DESC, r.id DESC
    LIMIT 20
), ...
```

Every page needs its own `ORDER BY` and `LIMIT` — a `LIMIT` without an
`ORDER BY` returns whatever the executor felt like handing over first.

## Hint 3
Stack the three pages with `UNION ALL` (they are disjoint by construction —
if they are not, that is exactly the bug this exercise is about, and `UNION`
would hide it), then finish the whole statement with one
`ORDER BY rating DESC, id DESC` so the 60 rows come back in feed order.
Watch what happens if you drop `, id` from a cursor comparison: with 199,504
reviews rated 5, the second page lands in the fours.
