## Hint 1
Two facts about the same customer again, one positive and one negative --
and the negative one is the reason a `WHERE o.status <> 'cancelled'` on a
join gives the wrong answer. Say what that join would actually return.

## Hint 2
`EXISTS (... any order ...)` and `NOT EXISTS (... a cancelled order ...)`,
both correlated on `o.customer_id = c.id`.

## Hint 3
There is a second good answer worth knowing for interviews: join
`customers` to `orders`, `GROUP BY c.id, c.name`, and use `HAVING count(*)
FILTER (WHERE o.status = 'cancelled') = 0`. The join guarantees "has
ordered"; the `HAVING` guarantees "none cancelled". Pick one, then write the
other in the lab and check the counts match.
