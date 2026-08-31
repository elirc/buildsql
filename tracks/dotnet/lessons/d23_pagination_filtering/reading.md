# Reading - dotnet/d23_pagination_filtering

## Notes

Paging is not "return fewer rows". It is a promise that a client walking the
whole collection sees every row exactly once, and the three things that break
that promise are the three things this set drills: an offset that is off by a
page, an order with no tiebreak, and a window that moves while the client is
walking it.

The pattern that unites all eight problems is that **the slice is decided in
the database**. `Skip`, `Take`, `Where`, `OrderBy` and `Count` on an
`IQueryable` are deferred - nothing runs until you enumerate - so composing
them costs one SQL statement and lets SQLite touch only the rows asked for. The
moment a `ToList()` sneaks in early, the same code reads the entire table and
throws most of it away, and the response body looks identical. That is why
several gates count commands: the body cannot tell you which version you wrote.

The other half of the set is the query string as a contract. `page`, `size`,
`sort`, `location` and a cursor are all values the client invented, and each of
them has a legal range. A parameter that is silently ignored, clamped, or
treated as "matches nothing" turns a client bug into a server that lies.

## ex1

What this was really testing: that the first page skips nothing. The offset is
`(page - 1) * size`, and every off-by-one page bug in the world is the moment
someone wrote `page * size` because `page` felt like an index.

The classic mistake is the other half - accepting `page` and `size` unchecked.
Clamping `page=0` up to 1 answers a question nobody asked; passing it straight
through computes a negative `OFFSET`. An unbounded `size` is worse: one client
sending `?size=1000000` turns a paged endpoint back into a full table scan, and
paging existed to prevent exactly that. The model answer validates the two
values against their ranges first and only then builds the query, so the range
check is a decision rather than an accident of arithmetic.

## ex2

What this was really testing: that `total` is a database question. A client
rendering "page 2 of 7" needs the count of the whole result set, and the page
it is holding cannot supply it.

The classic mistake is `db.Postings.ToList()` followed by `.Count` and
`.Skip().Take()` in memory - correct output, whole table read, and the command
counter is the only thing in the room that can see it. The second classic
mistake is `total / size`, which truncates: 25 rows in tens is 3 pages, not 2,
and the last two postings vanish from the UI. The model answer runs one
`CountAsync` and one windowed query over the same `IQueryable`, and computes
the ceiling with `(total + size - 1) / size` so no floating point is involved.

## ex3

What this was really testing: two independent ideas that always show up
together. First, a sort key is a vocabulary - `D23Board.Sorts` - not a column
name the client gets to pass through to your ORM. Second, a paged sort needs a
**total** order.

The tiebreak is the part people skip. Postings 1 and 14 both top out at 120000;
with only `ORDER BY SalaryMax` the database may return them in either order,
and it is free to choose differently for page 1 and page 2 - so a row appears
twice, or never. `ThenBy(x => x.Id)` costs nothing and makes the order total.
The classic mistake on the validation half is a `switch` with a `default` arm
that quietly serves the fallback order: `?sort=salray` then produces a
plausible, wrong report and no error anywhere. The model answer checks
membership first and answers 400 keyed `"sort"`.

## ex4

What this was really testing: composing optional predicates onto one
`IQueryable`. `if (remote is bool r) q = q.Where(...)` builds an expression
tree; nothing has executed yet, so four optional filters become four `AND`
clauses in a single `SELECT`.

The classic mistake is materialising first - `var all = await
db.Postings.ToListAsync();` and then LINQ-to-objects over the list. It passes
every correctness assertion and fails the command budget, which is the point:
the difference is invisible in the response and enormous in production.

The tag filter is the trap. `Tags.Contains("sql")` is a substring test, and
`nosql` contains `sql`, so `?tag=sql` quietly returns two postings that are not
tagged sql at all. Wrapping both sides in the delimiter -
`("," + x.Tags + ",").Contains("," + tag + ",")` - turns it into a whole
element test and still translates to `instr()`. The real lesson underneath is
that a comma separated column is a denormalised list, and every query against
one is a string trick.

## ex5

What this was really testing: that a paged response should tell the client how
to move, and that "out of range" and "out of bounds" are different failures.

`?page=0` is out of range: no such page can exist, the request is malformed,
400. `?page=4` of a three page result is out of bounds: the request is
perfectly well formed, the window simply lands past the end, and the honest
answer is 200 with an empty `items` and a `prev` link back. Answering 404 there
makes a client that over-scrolled look exactly like a client that asked for a
deleted resource.

The classic mistake in the links is hard coding `size=10` into them, so the
first click silently resets the page size the client chose. The model answer
builds both links from the *effective* page and size, and returns `null` rather
than a link whenever there is nothing on that side - because a `next` that
always exists walks a client off the end forever.

## ex6

What this was really testing: keyset pagination, and why an offset is not a
position. `OFFSET 10` means "skip ten rows of whatever this query returns
now". Insert a row that sorts earlier and every later row shifts down one, so
the client's next page repeats a row it already showed; delete one and a row is
skipped entirely. A cursor names a **place in the order** - here the pair
`(PostedDay, Id)` - and rows inserted elsewhere cannot move it.

The classic mistake is comparing only the first column: `WHERE PostedDay > 12`
after a cursor at `(12, 1)` drops posting 4, which also sits on day 12, and it
is gone from the feed forever with no error. The comparison has to be the whole
key: `PostedDay > d OR (PostedDay = d AND Id > id)`.

The model answer's other move is asking for `size + 1` rows. The existence of
that extra row is the answer to "is there a next page", so `nextCursor` is
`null` on the last page without a second `COUNT` - one query for the page and
its own terminator.

## ex7

What this was really testing: that the three slicing mechanisms are all just
operators on the same deferred query, and that a cursor is bound to the order
it was cut for.

Two details do the teaching. The cursor comparison must follow the direction of
travel: descending, "after" means `PostedDay < d OR (PostedDay = d AND Id <
id)`, and keeping `>` hands the client back the rows it has already seen, which
is an infinite loop rather than a wrong answer. And the filters must be
reapplied on every call, because the cursor carries a position and not a result
set - a feed that only honours `?remote=true` on the first page starts leaking
non-remote postings from page 2 onwards.

The classic mistake at the edges is treating an unreadable cursor as "no
cursor". That restarts the feed at the top, so the client loops over page 1
forever and nothing ever reports an error. `TryDecode` returning false is a 400
keyed `"after"`. Refusing `?sort=title` is the same instinct: a cursor over
`(PostedDay, Id)` cannot resume a title ordering, so the endpoint says so
instead of producing nonsense.

## ex8

What this was really testing: everything above on one endpoint, plus one new
idea - validation is a report, not a tripwire. Returning on the first bad
parameter makes a client with five mistakes fix one, resubmit, fail, and repeat
five times. Collecting into a dictionary and answering once tells it everything
in a single round trip, and RFC 9457's `errors` object exists precisely to
carry that shape.

The subtle one is the links. `next` has to carry the filters and the sort
forward, because `/d23/postings/search?page=2` without them is page 2 of a
completely different result set - the client clicks "next" and lands in
unfiltered data with no error anywhere. The model answer rebuilds the whole
query string from what was supplied, in a fixed order, which also means an
absent parameter stays absent instead of being materialised as a default the
client never chose. `remote` is written `true`/`false` by hand because
`bool.ToString()` produces `True`, and the wire has no capital letters in it.

The two remaining literals are stated in the README rather than left to taste:
`total` counts the filtered rows, and an empty result has `totalPages` 0, not
1. Gates compare literally, and "obvious" is where two reasonable people
disagree.

## Further reading

- [Efficient querying (EF Core)](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) - buffering versus streaming, projections, and the pagination section on why offsets get slower as they get deeper.
- [Pagination (EF Core)](https://learn.microsoft.com/en-us/ef/core/querying/pagination) - `Skip`/`Take`, the ordering requirement, and keyset pagination written out in full.
- [Client vs server evaluation](https://learn.microsoft.com/en-us/ef/core/querying/client-eval) - what happens when a predicate cannot be translated, and why it is worth knowing before the command counter tells you.
- [Parameter binding in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding) - optional query parameters, nullable value types, and binding failures.
- [Handle errors in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/handle-errors) - `TypedResults.ValidationProblem` and the shape of the `errors` dictionary.
- [RFC 9457 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457) - the media type every 400 in this set is speaking.
- [RFC 8288 - Web Linking](https://www.rfc-editor.org/rfc/rfc8288) - `next` and `prev` as relation types, and what a `Link` header would look like.
