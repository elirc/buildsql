# Reading - 113_drills_mixed_2

Second gauntlet. Read after your attempt, pass or fail.

## Notes

A theme runs through this set: *predicates that are not columns*. Whether a
staff member is a manager, whether a product carries a tag, whether an
order is a customer's first or last - none of these live in a field; each
is computed by a semi-join, a containment test, or a window over the
group.
The skill being drilled is noticing that the sentence's adjective ("the
managers", "the eco ones", "consecutive") is really a subquery, and then
deciding where that subquery belongs: inside a FILTER, inside an ON clause,
or staged in a CTE. The set closes with the report-engineering pattern that
makes multi-level summaries trustworthy - stage the filtered join once,
derive every number from that one staging CTE, and let the grand total
divide by itself as a built-in audit.

## ex1

String surgery as a group key, then count-sort-limit. What it tested:
left()/substr() (lesson 63 territory) composed with lesson 07's counting
and lesson 03's deterministic top-N - initials collide constantly, so the
tie-break earns its place. The classic mistake is sorting only by count
and shipping a five-row list that reorders itself between runs.

## ex2

Date arithmetic inside an aggregate. `DATE '2023-11-14' -
created_at::date` is an integer day count, so avg() consumes it directly;
skip the cast and the subtraction yields an interval, whose average then
needs different handling. What it tested: choosing the snapshot
deliberately (the dataset's last day - a report anchored on now() against
frozen data reads as years of backlog) and rounding once, at the end.

## ex3

Precision filtering on a document column. The path test is exact string
equality - `'/p/7'` - not a LIKE, which would also catch `/p/70` through
`/p/799`; the classic mistake here is exactly that pattern-match reflex.
What it tested: two JSONB reads with different jobs in one query (a filter
on `path`, a typed extraction of `value`), and the reference shows the
containment spelling `payload @> '{"path": "/p/7"}'` - the form lesson
42's GIN index would accelerate.

## ex4

A semi-join dressed as an adjective. "Managers" is `EXISTS (SELECT 1 FROM
staff r WHERE r.manager_id = s.id)` - the same table on both sides, lesson
10's self-referencing shape inside lesson 13's EXISTS, driving two FILTER
averages. What it tested: conditional aggregation over a computed
predicate, and reading NULL as "average of nobody" rather than an error.
The reference materialises the manager-id set in a CTE first - same
question, and safe from the NOT IN NULL trap only because it filters NULLs
explicitly.

## ex5

A pick across a join: the group key (category) is on products, the sort
keys are on reviews, and DISTINCT ON happily runs over the joined shape.
What it tested: lesson 49 composed with lesson 08, plus tie-break honesty
at scale - a million reviews at one-second granularity produce same-second
neighbours, so `r.id DESC` decides. The classic mistake is picking the
newest review first and joining after, which picks per *product* and then
keeps an arbitrary one per category.

## ex6

Symmetric difference, two ways. The set-operation spelling - (eco EXCEPT
sale) UNION (sale EXCEPT eco) - says the requirement almost verbatim; the
boolean spelling - the two containment tests compared with `<>` - is XOR
in one WHERE clause. What it tested: recognising "one but not both" as a
named shape rather than hand-rolling OR/AND/NOT logic, which is where the
classic mistake lives (forgetting to exclude the both-tags products, or
excluding them from only one side).

## ex7

Two opposite picks over the same partition, then a verdict. First and
last are the same one-per-group problem pointed in opposite directions -
two DISTINCT ON passes, or one pass numbering each customer's orders both
ways and harvesting the ends with max(total) FILTER (WHERE rn = 1). What
it tested: that double-pick composition, the population guard (a
single-order customer has no trajectory - HAVING count(*) >= 2 removes
them, and forgetting it returns rows whose first and last are the same
order, reading 'flat' with a straight face), and full tie-breaks at both
ends so the verdict is reproducible. The comparison itself is a plain
CASE - the work is everything before it.

## ex8

Report engineering. Everything derives from one staged CTE - the filtered
three-table join - so the grouped rows, the grand total, and the
percentages cannot disagree about which orders count. GROUPING SETS
((category), (status), ()) produces exactly the three views with no
cross-tab noise, and the share column needs the grand total beside every
row, which a one-row CTE cross-joined after grouping provides cleanly.
What it tested: all of that sequencing, plus the built-in audit - the ()
row's pct is 100.0 by construction, and if it is not, the base and the
total drifted apart somewhere.

## Further reading

- [GROUPING SETS, CUBE, and ROLLUP](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-GROUPING-SETS) - multi-level aggregation in one pass.
- [Combining Queries (UNION, INTERSECT, EXCEPT)](https://www.postgresql.org/docs/16/queries-union.html) - set semantics for the symmetric difference.
- [Row and Array Comparisons - EXISTS](https://www.postgresql.org/docs/16/functions-subquery.html) - semi-join predicates and the NOT IN NULL hazard.
- [Window Functions](https://www.postgresql.org/docs/16/functions-window.html) - lag() and the ordering discipline consecutive-row logic depends on.
