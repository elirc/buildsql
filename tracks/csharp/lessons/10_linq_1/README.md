# 10 — LINQ, part 1

You already know this lesson. You learned it in SQL.

```sql
SELECT c.name
FROM orders o
WHERE o.amount >= 100
ORDER BY o.amount DESC, o.customer;
```

```csharp
orders.Where(o => o.Amount >= 100)
      .OrderByDescending(o => o.Amount)
      .ThenBy(o => o.Customer)
      .Select(o => o.Customer);
```

Same query, same three ideas — restrict, sort, project — over a `List<Order>`
instead of a table. LINQ was designed by people who wanted SQL's expressiveness
inside a general-purpose language, and the resemblance is not a coincidence; it
goes all the way down to the vocabulary. `Where` is `WHERE`. `Select` is
`SELECT`. `OrderBy`/`ThenBy` are `ORDER BY` with its comma. `Skip`/`Take` are
`OFFSET`/`LIMIT`. `Any` is `EXISTS`. `Distinct` is `DISTINCT`. Lesson 11 adds
`GroupBy`, `Join` and the aggregates.

There is one difference that matters enormously, and it is the subject of ex3.
In SQL you hand the planner a description of the answer and it decides how to
get it. In LINQ-to-objects the operators run in the order you wrote them, and —
crucially — **not until somebody asks**. A LINQ query is a plan you are holding,
and every time you enumerate it, it runs again.

Everything you need to read this lesson's code you already built by hand:
lesson 08's iterators are how the laziness works, and lesson 09's lambdas are
what you pass to every operator.

## Concept — the operators, and when they run

LINQ operators are extension methods on `IEnumerable<T>`, which is why they
chain. They come in two families.

**Deferred operators return a new sequence and read nothing yet:**

```csharp
IEnumerable<Order> big = orders.Where(o => o.Amount >= 100);   // nothing has happened
foreach (Order o in big) { }                                    // NOW the filtering runs
```

`Where`, `Select`, `OrderBy`, `Skip`, `Take`, `Distinct`, `SelectMany`,
`GroupBy` — all deferred. (`OrderBy` is a special case: it defers, but when it
does run it must read *everything* before it can yield the first item.)

**Greedy operators read the sequence immediately and return an answer:**

```csharp
orders.Count();          orders.ToList();      orders.First();
orders.Any(o => ...);    orders.All(o => ...); orders.Single(o => ...);
```

The consequences of that split are worth stating plainly, because they are what
interviewers ask about:

1. A query built and never enumerated never runs at all.
2. A query enumerated twice runs **twice**. Over a `List` that is wasted CPU;
   over a database or a network stream it is two round trips.
3. `.ToList()` is how you say "run it now, once, and give me the data".

**The end-of-query operators and their failure modes.** `First` throws when
there is nothing; `FirstOrDefault` gives `null` (or `default(T)`). `Single`
throws unless there is **exactly one** — use it when "more than one" would mean
your data is broken, which is exactly what a unique id promises. `All` over an
empty sequence is `true`, vacuously, which surprises everyone once.

**Ordering.** `OrderBy(...).ThenBy(...)` is one sort with two keys. Writing
`OrderBy(...).OrderBy(...)` throws the first ordering away and sorts again —
the LINQ equivalent of writing two separate `ORDER BY` clauses and expecting
them to combine.

## Exercise 1 — restrict, sort, project

Edit `src/Lessons/L10_Linq1/Ex1.cs`. The shared `Order` record lives in
`Model.cs` and you never edit it; the gate builds five sample orders and hands
them to you.

`NamesOfOrdersOver(orders, minimum)` returns the customer name of every order
worth **at least** `minimum`, largest amount first, ties broken by customer
A–Z. `SortedLabels(orders)` returns every order as `"customer: amount"`,
ordered by customer A–Z and then by amount descending within each customer.

```
uv run dojo test csharp 10_linq_1 ex1
```

## Exercise 2 — asking questions

Edit `src/Lessons/L10_Linq1/Ex2.cs`. Five one-liners: `FirstIn` (the first
order in a category, or `null`), `AnyOver`, `AllUnder`, `CountIn`, and `WithId`,
which must **throw** when there is not exactly one match.

Each of these takes a predicate directly, so you almost never need a `Where`
first. And each has an opinion about the empty case — read the gate's
assertions about the empty sequence and the missing id before you write them.

```
uv run dojo test csharp 10_linq_1 ex2
```

## Exercise 3 — the query is not the answer

Edit `src/Lessons/L10_Linq1/Ex3.cs`. Three methods that look almost identical
and behave completely differently.

`Query` returns the query itself — built, unrun, touching nothing. `Snapshot`
returns the results, read from the source exactly once, immune to later
changes. `CountAndTotal` returns a count and a sum from **one** pass over the
sequence.

The gate hands all three a source that counts how many times it is walked. It
checks that building the query walks it zero times, that enumerating the same
query twice walks it twice, that the snapshot does not see an order added
afterwards while the live query does, and that `CountAndTotal` walks it once.
This is the multiple-enumeration bug, made visible.

```
uv run dojo test csharp 10_linq_1 ex3
```

## Exercise 4 — paging and top-N

Edit `src/Lessons/L10_Linq1/Ex4.cs`. `PageOfIds(orders, pageNumber, pageSize)`
returns one page of ids ordered by id, with pages numbered from 1 and a page
past the end coming back empty. `TopIds(orders, count)` returns the ids of the
biggest `count` orders, largest first, ties broken by customer A–Z.

Order before you take. `Take(3).OrderByDescending(...)` sorts three arbitrary
rows and looks plausible while being wrong — the same trap as putting `LIMIT`
in front of the wrong `ORDER BY` in SQL.

```
uv run dojo test csharp 10_linq_1 ex4
```

## Challenge — a whole report in one pipeline

Edit `src/Lessons/L10_Linq1/Challenge.cs`. `TopOfYear(orders, year, count)`
returns the biggest `count` orders of one year as
`"ada: 300 | cy: 120 | bo: 90"`, biggest first with the customer name as
tie-break — and `"(none)"` for a year with no orders.

Honest difficulty note: the chain is five steps you have already written; the
only genuinely new thing is that `string.Join` over an empty sequence gives
`""`, so the "no rows" case is a decision the library will not make for you.

```
uv run dojo test csharp 10_linq_1 challenge
```

## Review

`review1` is `Distinct` over a filtered projection, plus one more laziness
check. `dojo review` will bring it back.

## The gate

This is the entire gate class, `tests/Gates/L10_Linq1Tests.cs`:

```csharp
using System.Collections;

using CSharpDojo.L10_Linq1;

namespace CSharpDojo.Gates;

public class L10_Linq1Tests
{
    private static List<Order> Sample() => new List<Order>
    {
        new Order(1, "ada", "books", 120m, 2025),
        new Order(2, "bo", "toys", 45m, 2025),
        new Order(3, "ada", "toys", 300m, 2026),
        new Order(4, "cy", "books", 120m, 2026),
        new Order(5, "bo", "books", 90m, 2026),
    };

    /// <summary>A source that reports how many times somebody walked it.</summary>
    private sealed class CountingOrders : IEnumerable<Order>
    {
        public CountingOrders(List<Order> items) => Items = items;

        public List<Order> Items { get; }

        public int Enumerations { get; private set; }

        public IEnumerator<Order> GetEnumerator()
        {
            Enumerations++;
            return Items.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }

    [Fact]
    public void Ex1_FilterProjectAndOrder()
    {
        Teach.Equal("ada, ada, cy", string.Join(", ", Queries.NamesOfOrdersOver(Sample(), 100m)),
            "Three orders are 100 or more: 300 (ada), 120 (ada) and 120 (cy). Largest first, "
                + "and the two 120s are broken by customer name - which is what ThenBy is for. "
                + "A second OrderBy would throw the first ordering away - reread README ex1.");

        Teach.Equal("ada, ada, cy, bo, bo", string.Join(", ", Queries.NamesOfOrdersOver(Sample(), 45m)),
            "A minimum of 45 keeps the 45 itself: \"at least\" is >=, not >. Five orders, "
                + "largest first - reread README ex1.");

        Teach.Equal("ada: 300, ada: 120, bo: 90, bo: 45, cy: 120",
            string.Join(", ", Queries.SortedLabels(Sample())),
            "Customer A-Z first, then largest amount first WITHIN each customer - so ada's 300 "
                + "leads and cy comes last despite the 120 - reread README ex1.");

        Teach.Equal(0, Queries.NamesOfOrdersOver(Sample(), 1000m).Count,
            "Nothing qualifies, so the result is empty - not null, and not an exception.");
    }

    [Fact]
    public void Ex2_AskingQuestionsOfASequence()
    {
        Order? firstToy = Questions.FirstIn(Sample(), "toys");
        Teach.Equal(2, firstToy!.Id,
            "FIRST in sequence order, not smallest or largest: order 2 appears before order 3 "
                + "- reread README ex2.");

        Teach.True(Questions.FirstIn(Sample(), "shoes") is null,
            "No shoes here. FirstOrDefault returns null for a reference type rather than "
                + "throwing - First would have thrown - reread README ex2.");

        Teach.True(Questions.AnyOver(Sample(), 250m), "The 300 is over 250.");
        Teach.True(!Questions.AnyOver(Sample(), 300m), "Nothing is over 300 - the 300 itself "
            + "is not over 300. Any takes a strict comparison here because the prompt said "
            + "\"above\".");

        Teach.True(Questions.AllUnder(Sample(), 500m), "Every order is under 500.");
        Teach.True(!Questions.AllUnder(Sample(), 100m), "The 120s and the 300 are not.");
        Teach.True(Questions.AllUnder(new List<Order>(), 1m),
            "All over an EMPTY sequence is true - vacuously, because there is no "
                + "counterexample. Every language does this and it surprises people every "
                + "time - reread README ex2.");

        Teach.Equal(3, Questions.CountIn(Sample(), "books"), "Orders 1, 4 and 5 are books.");
        Teach.Equal(0, Questions.CountIn(Sample(), "shoes"), "None at all.");

        Teach.Equal("cy", Questions.WithId(Sample(), 4).Customer,
            "Single finds the one match - reread README ex2.");
        Teach.Throws<InvalidOperationException>(() => Questions.WithId(Sample(), 99),
            "There is no order 99. Single THROWS when there is not exactly one match, and "
                + "that loudness is the point: an id that matches nothing is a bug, not a "
                + "null - reread README ex2.");
    }

    [Fact]
    public void Ex3_AQueryIsAPlanUntilSomebodyRunsIt()
    {
        CountingOrders source = new CountingOrders(Sample());
        IEnumerable<Order> query = Deferred.Query(source, 100m);

        Teach.Equal(0, source.Enumerations,
            "Building the query must not read the source at all. If this is not 0 you called "
                + "ToList - reread README ex3.");

        Teach.Equal(3, query.Count(), "Three orders are 100 or more.");
        Teach.Equal(1, source.Enumerations, "Counting them walked the source once.");

        Teach.Equal(3, query.Count(), "The same query, asked again, gives the same answer...");
        Teach.Equal(2, source.Enumerations,
            "...but it walked the source AGAIN. That is the multiple-enumeration bug: over a "
                + "database or a network stream, this is two round trips. reread README ex3.");

        CountingOrders snapshotSource = new CountingOrders(Sample());
        IReadOnlyList<Order> snapshot = Deferred.Snapshot(snapshotSource, 100m);

        Teach.Equal(1, snapshotSource.Enumerations,
            "Snapshot reads the source exactly once, immediately - ToList is what does that - "
                + "reread README ex3.");
        Teach.Equal(3, snapshot.Count, "Three matching orders.");

        snapshotSource.Items.Add(new Order(6, "zed", "books", 500m, 2026));
        Teach.Equal(3, snapshot.Count,
            "A snapshot is data. Adding to the source afterwards cannot change it.");
        Teach.Equal(1, snapshotSource.Enumerations,
            "And reading the snapshot again does not touch the source at all.");

        CountingOrders liveSource = new CountingOrders(Sample());
        IEnumerable<Order> live = Deferred.Query(liveSource, 100m);
        liveSource.Items.Add(new Order(6, "zed", "books", 500m, 2026));

        Teach.Equal(4, live.Count(),
            "The live query ran AFTER the source changed, so it saw the new order. Same two "
                + "lines of code, opposite behaviour - reread README ex3.");

        CountingOrders onePass = new CountingOrders(Sample());
        (int count, decimal total) = Deferred.CountAndTotal(onePass);

        Teach.Equal(5, count, "Five orders.");
        Teach.Equal(675m, total, "120 + 45 + 300 + 120 + 90.");
        Teach.Equal(1, onePass.Enumerations,
            "Both numbers had to come from ONE pass. Calling .Count() and then .Sum() walks "
                + "the source twice - reread README ex3.");
    }

    [Fact]
    public void Ex4_SkipAndTakeArePagingAndTopN()
    {
        Teach.Equal("1, 2", string.Join(", ", Paging.PageOfIds(Sample(), 1, 2)),
            "Page 1 of size 2 is the first two ids - pages are numbered from 1, so page 1 "
                + "skips nothing - reread README ex4.");
        Teach.Equal("3, 4", string.Join(", ", Paging.PageOfIds(Sample(), 2, 2)),
            "Page 2 skips (2-1) x 2 = 2 rows.");
        Teach.Equal("5", string.Join(", ", Paging.PageOfIds(Sample(), 3, 2)),
            "The last page can be short.");
        Teach.Equal("", string.Join(", ", Paging.PageOfIds(Sample(), 9, 2)),
            "A page past the end is empty rather than an error - Skip past the end simply "
                + "yields nothing.");

        Teach.Equal("3, 1, 4", string.Join(", ", Paging.TopIds(Sample(), 3)),
            "300 first, then the two 120s with ada before cy. Order BEFORE you take - taking "
                + "first would give you three arbitrary rows - reread README ex4.");
        Teach.Equal("3", string.Join(", ", Paging.TopIds(Sample(), 1)), "Just the biggest.");
        Teach.Equal(5, Paging.TopIds(Sample(), 50).Count,
            "Asking for more than there are gives everything, without complaint.");
    }

    [Fact]
    public void Challenge_OnePipelineFromRowsToReport()
    {
        Teach.Equal("ada: 300 | cy: 120 | bo: 90", Reports.TopOfYear(Sample(), 2026, 3),
            "Filter to the year, order by amount descending with the customer as tie-break, "
                + "take 3, format each, join with \" | \" - reread README challenge.");

        Teach.Equal("ada: 120 | bo: 45", Reports.TopOfYear(Sample(), 2025, 3),
            "2025 has only two orders, so the report is shorter - no padding, no blanks.");

        Teach.Equal("ada: 300", Reports.TopOfYear(Sample(), 2026, 1),
            "count really does limit the report.");

        Teach.Equal("(none)", Reports.TopOfYear(Sample(), 1999, 3),
            "A year with no orders reports \"(none)\" - string.Join over an empty sequence "
                + "gives \"\", so this case needs a decision from you - reread README challenge.");
    }

    [Fact]
    public void Review1_DistinctFilteredProjectionsAndLaziness()
    {
        Teach.Equal("books, toys", string.Join(", ", Catalogue.CategoriesOver(Sample(), 100m)),
            "Orders of 100+ are in books (twice) and toys - Distinct collapses the repeat, and "
                + "the result is alphabetical - reread README review.");

        Teach.Equal("books, toys", string.Join(", ", Catalogue.CategoriesOver(Sample(), 45m)),
            "Every order qualifies now, and there are still only two categories.");

        Teach.Equal(0, Catalogue.CategoriesOver(Sample(), 9999m).Count, "Nothing qualifies.");

        CountingOrders source = new CountingOrders(Sample());
        IEnumerable<string> names = Catalogue.LazyNames(source);

        Teach.Equal(0, source.Enumerations,
            "Select is deferred too: building the projection reads nothing - reread README "
                + "review.");
        Teach.Equal("ada, bo, ada, cy, bo", string.Join(", ", names),
            "In source order, one name per order, duplicates and all.");
        Teach.Equal(1, source.Enumerations, "One enumeration, when you asked for it.");
    }
}
```

In plain English: `Ex1` checks the ordering, the tie-break, the `>=` boundary
and the empty result. `Ex2` walks every operator's found and not-found case,
including `All` over an empty sequence and `Single` throwing. `Ex3` is the
interesting one — the `CountingOrders` class in the gate records every walk of
the source, and the assertions read as a story about when your code ran.
`Ex4` pages three times plus past the end, then takes the top 1, 3 and 50.
`Challenge` reports two years and an empty one, and `Review1` is the
spaced-repetition variant.

## The teaching point

The SQL habits transfer, and so do the SQL mistakes. Ordering with no unique
tie-break makes paging unstable in both languages — a row can appear on page 1
and again on page 2 — which is why `PageOfIds` orders by the id. Filtering
after you have already materialised everything is `WHERE` applied by hand after
a full table scan. And LINQ's `Select` is `SELECT`: projecting to just the
columns you need is as good an idea here as it is there.

The habit that is *not* from SQL is watching for double enumeration. The
symptom in production is a method that takes `IEnumerable<T>`, calls `.Any()`
to check it is not empty, and then `foreach`es it — two walks, and if the
argument was a database query or a stream, two of something expensive. The fix
is one word: materialise once with `.ToList()` at the boundary where you stop
composing and start consuming. This is the same instinct as the SQL course's
"don't N+1", and it comes from the same place: knowing when the work actually
happens.

Next: **11_linq_2**, where `GroupBy`, `Join` and the aggregates finish the
translation.
