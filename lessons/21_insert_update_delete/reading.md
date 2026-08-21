# Reading - 21_insert_update_delete

Twenty lessons of reading, and now you can change things. The difference is
not syntax — `UPDATE` is easier than a window function — it is that a
`SELECT` with a wrong `WHERE` wastes your afternoon and an `UPDATE` with a
wrong `WHERE` wastes everyone's quarter.

## Notes

**The `WHERE` clause is the same clause it always was.** Everything you
learned in lesson 02 applies unchanged: precedence, `NULL` handling,
`BETWEEN`'s inclusivity. What changed is the blast radius. `UPDATE
products SET price = ...` with no `WHERE` is not an error; it is 10,000
rows.

**The professional ritual, in order.**

1. Write the `WHERE` as a `SELECT` first and read the row count. If the
   count surprises you, stop.
2. Wrap the mutation in an explicit transaction (lesson 23).
3. Use `RETURNING` to see what actually changed.
4. Check the reported row count against your prediction *before* you commit.

Every step of that is free in a `dojo lab` clone and none of it is free in
production. Rehearsing it here is the point of Part 3.

**Row counts are the database talking to you.** `UPDATE 47` when you
expected 3 is a bug report delivered after the fact. That is precisely why
step 1 exists: the count you want to be surprised by is the one from the
`SELECT`, not the one from the `UPDATE`.

**`UPDATE ... FROM` and `DELETE ... USING`.** Both let the `WHERE` clause
reference other tables; the difference is only the keyword, and it exists
because `DELETE FROM` already spent the word `FROM`. Two things to know.
The join condition lives in the `WHERE` with everything else, so omitting it
silently produces a cross product and updates far more than you meant. And
if the extra table matches a target row more than once, PostgreSQL picks one
match arbitrarily and updates the row once — no error, non-deterministic
result. When the joined side can produce duplicates, aggregate it in a
subquery first.

**`INSERT ... SELECT` is how data gets copied and transformed.** It is also
the shape of most backfills: `INSERT INTO new_table SELECT ... FROM
old_table WHERE ...`. Backfilling a large table in one statement holds locks
and generates a single enormous transaction; production backfills run in
batches, with the batch boundary chosen so each transaction is short.

**`RETURNING` is atomic feedback.** `INSERT ... RETURNING id` gives you the
generated key without a second query and without a race. `DELETE ...
RETURNING *` gives you the rows you just destroyed, which is the cheapest
possible archive. `UPDATE ... RETURNING` lets you see exactly which rows a
conditional update actually caught. In application code it removes an entire
class of read-after-write bugs.

**What a mutation does *not* do.** It does not fire your application's
callbacks, invalidate your cache, or reindex your search engine. Anything
outside the database does not roll back with it — a fact that becomes the
central design problem in lesson 23's teaching point.

**MVCC, briefly.** An `UPDATE` in PostgreSQL does not overwrite a row; it
writes a new version and marks the old one dead. That is why updating every
row of a table doubles its size until `VACUUM` reclaims the space, and why
a long-running transaction can prevent that reclamation. Lesson 44 is
entirely about the consequences; for now, just know that "update" means
"insert plus tombstone" underneath.

## ex1 — merch drop (INSERT)

A multi-row `VALUES` list, including a JSONB literal written as a quoted
string and cast implicitly by the column's type. One statement inserting
three rows is not just tidier than three statements — it is one transaction,
one round trip, and one row count to check.

## ex2 — targeted price cut (UPDATE)

The graded skill is scope, not syntax. The gate snapshots the sum of every
*other* product's price before running your statement and compares
afterwards — which is exactly the check you should be running on yourself.
Note the `round(price * 0.9, 2)`: without the rounding you would store more
decimal places than the column's scale allows and PostgreSQL would round for
you, which is fine here and is not fine when the rounding rule matters.

## ex3 — takedown (DELETE)

`DELETE` has no undo outside a transaction. The gate counts the collateral
because that is the only number anyone cares about after an incident: not
"did the right rows go" but "did anything else".

Two conditions, and both are load-bearing: drop `product_id = 42` and you
delete every 1-star review in the database, drop `rating = 1` and you wipe
product 42's entire review history. Neither mistake raises an error, and
neither is visible in the row count unless you predicted it first. This is
the exercise where the rehearse-as-a-SELECT habit stops being advice and
starts being the job.

## ex4 — UPDATE with a join

The join condition in the `WHERE` is load-bearing in a way that has no
analogue in `SELECT`: omit it in a `SELECT` and you get a visibly absurd
number of rows, omit it here and you get a silent, committed cross product.
Rehearse it as a `SELECT` — the same `FROM ... WHERE` reads as a perfectly
ordinary join.

## ex5 — DELETE with a join

Same shape, different keyword. Worth noticing that this could also be
written with a subquery — `WHERE product_id IN (SELECT id FROM products
WHERE ...)` — and that the subquery version is harder to get catastrophically
wrong, because there is no join key to forget. When a `USING` clause is not
buying you anything, the subquery is the safer idiom.

## ex6 — RETURNING what you changed

The gate reads your statement's result set, so `RETURNING` is the exercise.
The habit worth forming: any mutation whose effect you would otherwise
verify with a follow-up `SELECT` should have a `RETURNING` clause instead.
It is fewer round trips, it is race-free, and it makes the statement
self-documenting about what it claims to touch.

## challenge — reorder flow (INSERT ... SELECT)

Two `INSERT ... SELECT` statements, and the second depends on the first —
which is a transaction waiting to be declared. Note the id arithmetic (`id +
1000000`) standing in for a sequence: real schemas would use `generated
always as identity` and let the database allocate, which lesson 24 covers.

## Further reading

- [`INSERT`](https://www.postgresql.org/docs/16/sql-insert.html) — `VALUES`, `INSERT ... SELECT`, `RETURNING`, and `ON CONFLICT` (lesson 22).
- [`UPDATE`](https://www.postgresql.org/docs/16/sql-update.html) — the `FROM` clause and the explicit warning about non-deterministic results when the joined table matches more than once.
- [`DELETE`](https://www.postgresql.org/docs/16/sql-delete.html) — `USING`, `RETURNING`, and the note on `TRUNCATE` as the faster alternative when you mean "all of them".
- [`RETURNING` data from modified rows](https://www.postgresql.org/docs/16/dml-returning.html) — short, and it will change how you write application code.
