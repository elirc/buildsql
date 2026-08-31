# Reading - 114_drills_mixed_3

The last set in the course. Read after your attempt, pass or fail.

## Notes

If the earlier gauntlets drilled welding, this one drills *sequencing under
pressure*: every exercise has an order of operations that matters more than
any single clause. Aggregate before you pick a winner (ex2), reduce the big
table before you anti-join it (ex3), carry bookkeeping through a recursion
(ex5), collapse to the right grain before hunting patterns (ex7). The
interview observation behind the set: senior candidates are not
distinguished by knowing more syntax - they are distinguished by naming the
stages out loud before writing any of them, and by adding the two
characters of tie-break or NULLIF that make an answer *stay* correct. Every
query here has at least one such two-character decision.

## ex1

Share-of-total over a grouped result: a window `sum() OVER ()` riding the
five grouped rows, or a scalar subquery for the denominator. What it
tested: knowing a window can run *after* grouping, over the groups
themselves. The classic mistake is `100 * salary / sum(salary)` inside the
grouped pass - mixing grains mid-aggregate - or integer division eating
the decimals before round() sees them.

## ex2

Aggregate, then pick, then decorate. Units per (week, product) must exist
before "best per week" means anything, and the name join is presentation,
attached last. What it tested: the three-stage sequencing plus edge-bucket
honesty (Monday-truncated weeks overlap the month's edges). The classic
mistake is DISTINCT ON over raw joined lines - picking the biggest single
line, not the biggest weekly total - which returns confident nonsense.

## ex3

An anti-join against a computed slice of a 3,000,000-row stream. Both
spellings are correct; the reduce-first one (DISTINCT hot product ids in a
CTE, then LEFT JOIN ... IS NULL) scans events once instead of potentially
per product, which is the habit that survives contact with production. The
two traps: comparing the payload value as text (where '99' >= '999' is
false but '9990' would love a word) and pattern-matching the path (`LIKE
'/p/7%'` catches forty pages). Exact equality on a built string, cast
before comparing.

## ex4

A pivot compared against itself. HAVING cannot see output aliases, so the
comparison repeats both FILTER aggregates - or you stage the pivot in a
CTE and write a plain WHERE over named columns, which is the reference's
choice and the more maintainable one when the pivot grows. What it tested:
that alias-visibility rule under combination pressure, and reading the
result honestly - cancelled-versus-shipped is a noisy near-tie in this
data, so the qualifying list is short and unstable across reseeds, which
is exactly what the numbers say it should be.

## ex5

Recursion with an anchor column. The seed rows are the CEO's direct
reports; their id and name ride every recursive step unchanged, so the
final GROUP BY can attribute each descendant to the right lieutenant. What
it tested: lesson 14's recursive CTE plus the technique of carrying
constant bookkeeping through the walk - and two details people miss:
grouping by anchor *id* (names can collide), and counting the lieutenant
themselves, which the seed row does automatically.

## ex6

Expansion then pick: the tag rows do not exist until
jsonb_array_elements_text manufactures them, and then DISTINCT ON (tag)
with a full tie-break is lesson 49 verbatim. What it tested: composing the
two without staging confusion, and accepting a correct oddity - a product
carries two tags and may win both. The classic mistake is trying to pick
per product first and then per tag, which loses any tag whose flagship was
out-priced within its own product's other tag.

## ex7

Gaps and islands. Reduce to DISTINCT (customer, month) first - order
counts per month are noise here - then the anchor trick: month minus
(row_number months) is constant exactly along a consecutive run, so
consecutive months form a group and HAVING count(*) >= 3 finds the
streaks. What it tested: the single most-asked hard interview pattern in
analytics SQL. The reference's triple self-join (m, m+1, m+2 all present)
is easier to believe and stops scaling the moment the question says
"five"; the islands version changes one digit. Know both, deploy the
second.

## ex8

The end-to-end weld: parse (split_part + cast), pivot (two FILTER counts
in one grouped pass), decorate (join products), rank deterministically,
and guard the division. Each piece appeared alone earlier in the course;
what it tested is doing all five without leaking - the one real trap being
the two-CTE formulation, where purchases must arrive via LEFT JOIN +
COALESCE or a viewed-but-never-bought page silently vanishes instead of
reporting the 0.0 conversion that was the whole point of measuring. The
NULLIF guard costs nothing today and saves the report the day a page has
purchases attributed but no views.

## Further reading

- [WITH Queries - Recursive Queries](https://www.postgresql.org/docs/16/queries-with.html#QUERIES-WITH-RECURSIVE) - the recursion contract and termination.
- [Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - row_number() as the engine of both picks and islands.
- [JSON Functions and Operators](https://www.postgresql.org/docs/16/functions-json.html) - extraction and set-returning expansion.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - FILTER counts and their NULL behaviour.
- [PostgreSQL Wiki - Don't do this](https://wiki.postgresql.org/wiki/Don%27t_Do_This) - a checklist of the quiet mistakes this course spent 115 lessons unlearning.
