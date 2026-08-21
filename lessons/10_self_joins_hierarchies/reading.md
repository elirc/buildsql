# Reading - 10_self_joins_hierarchies

A self-join is not a special feature. It is the ordinary join, applied to a
table that happens to appear twice in the same `FROM` clause — and the only
new idea is that an alias creates an *independent* view of the same rows.

## Notes

**Aliases are the whole mechanism.** `FROM staff e JOIN staff m` puts two
independent copies of `staff` in scope. PostgreSQL does not care that they
are the same physical table; it scans it twice (or scans once and uses an
index for the second, which is why lesson 31's first index makes self-joins
dramatically faster). Once you stop reading `staff e` as "the staff table"
and start reading it as "a row playing the employee role", every hierarchy
query gets easier.

**Self-joins answer *relative* questions.** `e.salary > m.salary`,
`a.created_at < b.created_at`, `a.id < b.id` — comparing two rows of the
same table is impossible with a `WHERE` clause alone, because `WHERE` sees
one row at a time. This is the fundamental limitation that self-joins work
around, and it is also the limitation that **window functions** (lesson 15)
address far more elegantly. "Compare each row to its neighbours" is a
self-join in Part 1 and a `lag()` in Part 2, and the window-function version
is usually both shorter and faster.

**The pairs idiom.** To enumerate unordered pairs from one table, join it to
itself with a strict inequality on the key:

```sql
FROM staff a JOIN staff b ON a.department = b.department AND a.id < b.id
```

`a.id < b.id` does two jobs at once: it kills self-pairs (a row cannot be
less than itself) and it keeps exactly one of each mirror image. With `<>`
instead you get every pair twice. This is the standard answer to a whole
family of dedup and "find duplicate records" interview questions, and it is
worth being able to write from memory.

**Watch the cardinality.** A self-join on a *non-unique* key is a many-to-many
join, and it squares the group size: 61 finance staff produce 1,830 pairs;
a 5,000-person department would produce 12.5 million. Self-joins on
low-cardinality columns are one of the classic ways to accidentally generate
a billion rows from a small table.

**Where self-joins run out.** They handle a *fixed* number of levels. Two
levels up needs two joins; "the whole chain to the CEO" needs as many joins
as the tree is deep, which you cannot write when the depth is data-dependent.
That is a genuine expressiveness limit, not a stylistic one, and recursive
CTEs (lesson 14) are the answer. Recognising which of the two a question
needs — fixed depth or arbitrary depth — is a real senior-engineer tell.

**Adjacency list versus the alternatives.** `manager_id` pointing at the
same table is the *adjacency list* model: trivial to update, cheap to query
one level, expensive to query transitively. The alternatives trade the other
way — materialised path (store `'/1/7/42/'` and use `LIKE '/1/7/%'`),
nested sets (store left/right bounds, O(1) subtree queries, painful
inserts), and closure tables (a row per ancestor-descendant pair). PostgreSQL
users mostly stay with the adjacency list plus a recursive CTE, because
`WITH RECURSIVE` is fast enough and nothing else has to be maintained.

## ex1 — who reports to whom

499 rows from 500 staff, and the missing row is the CEO. This is lesson 09's
point arriving without being announced: an inner join silently dropped the
row that had no match. Almost every "why is the total one short?" bug is
this.

## ex2 — finance pairs

1,830 pairs from 61 people — n(n-1)/2, the handshake number. Try the query
with `a.id <> b.id` and count: 3,660, exactly double. Then try it with no
condition beyond the department and count 3,721, which includes the 61
self-pairs. Seeing all three numbers once makes the idiom permanent.

## ex3 — the org chart with nobody missing

The fix for ex1, and the reason to reach for `LEFT JOIN` as a *default* when
the left side is the population you are reporting on. Note that the NULL in
the output is doing real work: it says "this person has no manager", which
is a fact, not a gap in the data.

## ex4 — two levels up

Three aliases, two joins, one fixed depth. The exercise is really an
argument: count how many joins you would need for "everyone in the CEO's
reporting tree" and notice that the answer depends on data you do not have
at write time. Lesson 14 replaces this entire pattern with six lines that
work at any depth.

## challenge — paid more than the boss

The join condition and the filter are doing different jobs: `m.id =
e.manager_id` relates the rows, `e.salary > m.salary` selects among the
related pairs. Both are comparisons between two rows of the same table,
which is exactly what `WHERE` alone cannot do. Nineteen rows, and the reason
there are any is that the generator overlaps the salary bands between levels
on purpose — as real companies do, which is why this report exists.

## review1 — the teammates of employee 42

One hat holds employee 42, the other holds everyone sharing their
`manager_id`, and the `WHERE` excludes 42 from their own team list. No
subquery needed. When this comes back, write it without looking at ex1
first.

The detail worth re-deriving is why `a.id <> b.id` is right here while
`a.id < b.id` was right in ex2. In ex2 you wanted each *pair* once, so the
strict inequality removed the mirror image. Here you have a fixed anchor row
and want everyone else, so the mirror image never arises and you only need
to exclude the self-match. Same shape, different question, different
operator — and getting it backwards silently halves your answer.

## Further reading

- [Joined Tables and table aliases](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the section on `FROM` items and aliases, which is what makes a self-join legal at all.
- [`WITH` Queries — recursive](https://www.postgresql.org/docs/16/queries-with.html) — where fixed-depth self-joins stop and lesson 14 begins. Read the org-chart example.
- [Window Functions Tutorial](https://www.postgresql.org/docs/16/tutorial-window.html) — the other escape from "compare a row to its neighbours". Preview of lesson 15.
- [Use The Index, Luke — Joins](https://use-the-index-luke.com/sql/join) — why a self-join on an unindexed column is quadratic, and what an index on `manager_id` would change.
