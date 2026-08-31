# Reading - dotnet/d14_projections_dtos

## Notes

Every problem in this set is the same move: put the shape you want to send on
the wire *inside* the query, so the database builds it. That single habit buys
three things at once, and the gates check all three.

It buys a **contract**. A `FilmCard` cannot leak an email or a budget, because
those columns are not in it. Returning entities is not a shortcut, it is
publishing your schema - and every column you add later is published too.

It buys **traffic**. `Select` is the only thing that narrows the SELECT list;
`Include` widens it. A projection reads four columns where an entity graph
reads twenty, and the difference is invisible in the response body, which is
why the gates count commands and read the raw body rather than trusting
equality.

And it buys **no tracking**. A projection into a non-entity type has nothing to
track, so EF takes no snapshot and does no fix-up - it is `AsNoTracking` you
get for free.

The one rule that makes it work: everything inside the projection is still an
expression tree. Ordering, filtering, conditionals, `Sum`, `Any`,
`FirstOrDefault` and even nested `ToList()` are translated. The moment you call
something the provider cannot translate, you get either a runtime error or a
silent client evaluation - which is the same correct answer at ten times the
cost.

## ex1

What this was really testing: whether you reach for `Include` or for `Select`
when the client needs one field from a related row. `Include` says "load the
whole director"; the projection says "give me the name". Both produce the name;
only one of them is a contract.

The classic mistake is the shipped code - hand entities to the serializer.
`Film.Director.Films` points back at the film, so `System.Text.Json` walks a
cycle and throws; and in the versions where it does not throw, the email and
budget columns ride along silently. The model answer's reasoning: name the four
fields you promised, and the JOIN, the narrow SELECT list and the safe body all
follow from that one `Select`.

Worth noticing: with the projection in place the `Include` becomes dead code.
`f.Director!.Name` is enough - EF sees the navigation in the expression tree and
joins for it.

## ex2

What this was really testing: that a nested collection inside a projection is
one query, not two. `d.Films.Select(f => f.Title).ToList()` sits inside the
outer `Select` and EF plans the whole thing together.

The classic mistake is the two-step: load the director, then load the films, and
report a correct body in two round trips - or worse, load the director with
`Include(d => d.Films)` and map in memory, which drags every film column back
for a list of strings. The model answer's reasoning: the shape is one object, so
it is one expression, so it is one query; and `FirstOrDefaultAsync` on the
projected sequence gives the 404 test for free, because a missing director
projects to `null` rather than throwing.

## ex3

What this was really testing: that a ternary in a projection is a SQL `CASE`,
not C#. The database can decide "sold out / filling / open" perfectly well, and
deciding it there means the seat counts never leave the server.

The classic mistake is `ToListAsync()` first and the conditional after - correct
output, whole table on the wire, and the raw seat numbers now inside your
process where somebody will eventually serialize them. The second mistake is
`(double)s.Sold / s.Seats >= 0.8`, which drags floating point into a comparison
that integers answer exactly; `sold * 10 >= seats * 8` is the same predicate
with no rounding to argue about. The model answer's reasoning: nest the two
conditions in the order of severity, sold-out first, and let the provider emit
one `CASE WHEN`.

## ex4

What this was really testing: absence. `!f.Screenings.Any()` translates to `NOT
EXISTS`, which is the cheapest way a relational database can answer "nothing
matches" - it stops at the first row it finds.

The classic mistake is loading films with their screenings and filtering the
result with `Count == 0`, which reads every screening in the database to
discover that two films have none. A subtler one is a `GroupJoin` or a manual
`Except` over ids, both correct and both more query than the question needs. The
model answer's reasoning: the question is a predicate over a navigation, so it
belongs in `Where`, and the projection then only has to carry the two fields the
contract names.

## ex5

What this was really testing: a correlated subquery in a projection. `f.Screenings
.OrderBy(...).Select(...).FirstOrDefault()` runs once per film, inside the single
statement, and the provider is very good at that; the equivalent `foreach` over
films is the N+1 you were hired to remove.

The classic mistake, besides the loop, is the cast. `FirstOrDefault()` over an
empty sequence gives you the CLR default - `0` for `int`, and `""` is what you
will try to explain to the front end. Projecting `(int?)s.Day` and
`(string?)s.Room` makes the empty case genuinely `null`, which is what the
contract promised for a film nobody has scheduled. The model answer's reasoning:
order by day then id so the tie is deterministic, cast to nullable so absence has
a value, and never filter the outer query - every film appears.

## ex6

What this was really testing: where the filter goes. The rooms are filtered, the
films are not, and the directors are not - so the `Where` belongs on the
innermost collection and nowhere else. Move it up one level and Long Meridian
and Vinyl Country vanish from a slate that is supposed to show them as empty.

The classic mistake is exactly that migration of the predicate outward, usually
via `Include(...).ThenInclude(...)` plus filtered includes, which changes what
rows *exist* in the result rather than what rows are *listed inside* one. The
model answer's reasoning: build the tree from the inside out - rooms, then a
`SlateFilm`, then a `DirectorSlate` - and each ordering clause sits next to the
collection it orders. Three levels, one expression, and the query budget is
never in danger.

## ex7

What this was really testing: that "one endpoint contract" and "one query" are
different requirements. Films and directors are different tables with different
shapes, so two queries is the honest answer; what must be unified is the
`SearchHit` they both become and the order they arrive in.

The classic mistakes come in pairs. On the matching side, `Contains` after a
`ToLower()` on both sides works and makes the predicate unsargable - it cannot
use an index on any real database; `EF.Functions.Like` keeps the comparison in
SQL, and SQLite's `LIKE` is already case-insensitive for ASCII. On the validation
side, returning `BadRequest("...")` passes the status check and fails the body
check: the contract asks for a validation problem, which is
`TypedResults.ValidationProblem` with the dictionary keyed by the offending
parameter name. The model answer's reasoning: validate first and return early,
then two narrow projections, then `Concat` - films before directors, because the
order is part of the contract too.

## ex8

What this was really testing: aggregation discipline under a budget you cannot
meet by accident. Five numbers and a ranking, three queries, and the only way
there is to make the database do the arithmetic.

Three techniques carry it. `GroupBy(s => 1)` is the idiom for "aggregate the
whole table" and collapses count, sum and conditional-count into one row -
`Sum(s => cond ? 1 : 0)` is the portable spelling of a counted condition. The
ranking is a projection with `Sum` over a navigation, ordered and `Take(3)`-ed
*before* materialisation, so the database returns three rows rather than six.
And the integer division is not an accident to be tolerated but the specified
rounding: `250 * 100 / 280` is 89 in SQL exactly as the contract says.

The classic mistake is `ToListAsync()` at the top and LINQ-to-Objects
underneath. It is easy to write, it always agrees with the expected numbers, and
it reads the entire schema to produce five integers - which is why the gate
grades the command count rather than the body alone.

## Further reading

- [Complex query operators - EF Core](https://learn.microsoft.com/en-us/ef/core/querying/complex-query-operators) - projections, correlated subqueries and nested collections.
- [Single vs. split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries) - why a projected collection stays one query and what cartesian explosion costs.
- [Efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) - projecting only what you need, `AsNoTracking`, and the N+1 patterns to look for.
- [Client vs. server evaluation](https://learn.microsoft.com/en-us/ef/core/querying/client-eval) - what happens when the provider cannot translate part of your expression.
- [Database functions and EF.Functions.Like](https://learn.microsoft.com/en-us/ef/core/providers/sqlite/functions) - keeping the match in SQL.
- [Handle errors in minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/handle-errors) - `TypedResults.ValidationProblem` and the shape of an errors dictionary.
