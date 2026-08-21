# Reading - 25_constraints

A constraint is the only validation that cannot be bypassed. Application
code has versions, races, bugs, and that one batch script somebody runs
directly against the database at 2 a.m. A constraint is checked every time,
by everyone, atomically — which is why the constraints you declare are the
only rules that are actually true.

## Notes

**`NOT NULL` is the cheapest and most under-used constraint.** Every
nullable column is a standing promise that all future queries handle lesson
05 correctly. Declaring `NOT NULL` where absence is meaningless converts a
whole class of runtime surprises into a write-time error, and — as lesson 05
showed — it is what lets you *prove* a `NOT IN` is safe.

**`DEFAULT` pairs with `NOT NULL`.** Together they say "this always has a
value, and here is the one to use when nobody supplies it". A `DEFAULT` on a
nullable column is a much weaker statement, because an explicit NULL still
gets through.

**`UNIQUE` is almost never about one column.** It is about a column within a
scope: a code within a campaign, an email within a tenant, a slug within a
site. Getting the scope wrong is the common error, and it is expensive
because the fix is a migration. Two PostgreSQL specifics worth knowing:
`UNIQUE` creates an index (which is what `ON CONFLICT` arbitrates on), and
NULLs are treated as distinct from each other by default — so a nullable
unique column accepts unlimited NULL rows. PostgreSQL 15 added `UNIQUE
NULLS NOT DISTINCT` when you want the other behaviour.

**`CHECK` sees one row and nothing else.** Any boolean expression over the
row's own columns, including expressions relating two columns to each other.
What it cannot do: consult another table, count rows, or reference the
current time (the expression must be immutable, because PostgreSQL may
re-evaluate it during a table rewrite). "No overlapping bookings for the
same room" is therefore not a CHECK — it needs an `EXCLUDE` constraint,
PostgreSQL's own extension built on GiST: `EXCLUDE USING gist (room WITH =,
daterange(starts_on, ends_on) WITH &&)`. It is one of the best features
almost nobody knows about.

**Foreign keys, and the `ON DELETE` decision.** The policy is a *domain*
question, not a technical one — "what should happen to redemptions when a
gift card is deleted?" belongs to a product owner; the schema records the
answer.

- `NO ACTION` / `RESTRICT` (the default): refuse to delete a referenced
  parent. The difference between them is only about deferral timing.
- `CASCADE`: children die with the parent. Correct for rows that have no
  independent existence — order lines without an order. Dangerous
  everywhere else, because a single `DELETE` can silently remove a subtree
  you did not picture.
- `SET NULL`: children survive, orphaned deliberately. Requires the column
  to be nullable, which is itself the design statement.

**Foreign keys are not free, and they are worth it.** Every child insert
checks the parent, and every parent delete checks for children — the latter
being a full scan of the child table unless the FK column is indexed.
PostgreSQL does *not* index foreign-key columns automatically; you must do
it yourself, and lesson 33 turns that fact into a war story.

**Constraints are documentation that cannot go stale.** A reader of your
schema learns what is impossible without reading any application code. This
is why the senior move when inheriting a schema is: list what *should* be
impossible, check which of those are actually constrained, and close the gap
before it closes on you. Adding constraints to live tables safely is lesson
28.

**Naming.** PostgreSQL will invent a name like `giftcards_balance_check` if
you do not supply one, and that name appears in the error message your
application has to interpret. Name constraints explicitly when the error
matters to a user.

## ex1 — the giftcards table

The gate's probes are the teacher here: a negative balance, a duplicate
code, and an omitted `issued_on`. Notice that the third probe checks a
*default*, not a rejection — constraints and defaults together are what make
a table's behaviour complete, and a review that checks only the rejections
misses half of it.

## ex2 — redemptions with a CASCADE

The behavioural test is the important part. `assert_fk` proves the policy is
recorded; deleting a card and finding the redemption gone proves it *works*.
Constraint review that stops at the catalog is exactly the review that
misses a `NOT VALID` constraint nobody ever validated (lesson 28).

## ex3 — belt and suspenders on email

`email LIKE '%@%'` is a deliberately weak check, and that is a lesson in
itself: validating email addresses properly in SQL is a fool's errand, and a
CHECK that rejects the obviously-broken is worth far more than a regex
nobody can read and everybody eventually disables. Constraints should catch
garbage, not adjudicate standards.

## ex4 — unique, but only within a scope

Composite uniqueness, and the probe that matters most is the *accepting*
one: the same code in a different campaign must work. It is easy to write a
constraint that is stricter than the business rule, and stricter constraints
fail in production rather than in review, because nobody tests the case they
did not know was allowed.

## ex5 — orphaning gracefully

`SET NULL` requires a nullable column, and that requirement is the design
conversation in miniature. If you find yourself wanting `SET NULL` on a
column that is conceptually mandatory, the honest answer is usually
`RESTRICT` — refuse the delete and make somebody decide — or a soft-delete
flag on the parent instead of a real deletion.

## ex6 — a CHECK across two columns

Row-level rules that relate columns are underused, and the reason to reach
for them is that they are checked on `UPDATE` as well as `INSERT`. The
paragraph about `EXCLUDE` constraints is worth chasing down in the docs: the
non-overlap rule is one of the most commonly hand-rolled (and most commonly
racy) validations in application code, and PostgreSQL enforces it properly
with one line.

## challenge — the join table

A composite primary key with no surrogate `id`. The pair *is* the identity,
duplicates are structurally impossible, and the table cannot represent
anything meaningless. This is lesson 24's "arrays versus join tables"
answered: the join table gets you referential integrity, a queryable
reverse direction ("who wants this product?"), and per-row metadata later
without a migration.

## Further reading

- [Constraints](https://www.postgresql.org/docs/16/ddl-constraints.html) — `NOT NULL`, `CHECK`, `UNIQUE`, primary keys, foreign keys, and `EXCLUDE`. The `ON DELETE` table is in here.
- [`CREATE TABLE`](https://www.postgresql.org/docs/16/sql-createtable.html) — inline versus table-level constraint syntax, and `UNIQUE NULLS NOT DISTINCT`.
- [`ALTER TABLE`](https://www.postgresql.org/docs/16/sql-altertable.html) — adding constraints to a table that already has data, including `NOT VALID`. Lesson 28.
- [Index Types — GiST and exclusion constraints](https://www.postgresql.org/docs/16/rangetypes.html) — the range-type page, which shows the non-overlapping-bookings `EXCLUDE` constraint in full.
