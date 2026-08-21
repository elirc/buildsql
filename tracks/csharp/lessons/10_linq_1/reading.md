# Reading - csharp/10_linq_1

## Notes

**What a LINQ operator actually is.** `Where` is a static extension method on
`IEnumerable<T>` that returns an iterator — roughly the `Evens` method you wrote
by hand in lesson 08, generalised over a predicate you supply. That is the whole
trick: lesson 08 gave you laziness, lesson 09 gave you behaviour-as-a-value, and
LINQ is those two ideas plus about forty well-chosen method names. There is no
compiler magic in `orders.Where(...)`; you could write every operator yourself
in an afternoon, and people did, before 2007.

**Method syntax versus query syntax.** Everything in this lesson can also be
written as `from o in orders where o.Amount >= 100 select o.Customer`, which
the compiler rewrites into exactly the method calls you have been writing. Query
syntax reads better for joins and multi-level groupings (lesson 11 shows both);
method syntax is what most C# codebases use for everything else, mostly because
not every operator has a keyword.

**LINQ to Objects versus LINQ to a database.** The methods you are calling take
`Func<T, bool>` — a compiled lambda, a piece of executable code. The versions
on `IQueryable<T>` take `Expression<Func<T, bool>>` — a *data structure
describing* the lambda, which EF Core walks and turns into SQL. Identical
source code, two completely different execution stories: one runs your delegate
per item in memory, the other sends a `WHERE` clause to Postgres. Knowing which
one you are holding is the single most valuable LINQ skill in a .NET job, and
the tell is the static type: `IEnumerable<T>` means "in this process",
`IQueryable<T>` means "there is a translator downstream".

**Deferred execution, precisely.** `orders.Where(p)` constructs an object that
holds a reference to `orders` and to `p`. Nothing else. The filtering happens
inside `MoveNext`, one item at a time, when someone enumerates it. Consequences:
the query sees the source *as it is at enumeration time*; enumerating twice does
the work twice; and an exception in your predicate surfaces at the `foreach`,
not at the line that looks like it built the query.

**Which operators are greedy.** `ToList`, `ToArray`, `ToDictionary`, `Count`,
`Sum`, `Min`, `Max`, `Average`, `First`, `Single`, `Last`, `Any`, `All`,
`Contains`, `Aggregate`. Everything else you have met defers. `OrderBy` is the
subtle one: it is deferred, but it cannot yield its first item until it has read
every item, so it buffers the whole sequence — which is why sorting an infinite
sequence hangs and filtering one does not.

## ex1

The chain order is the lesson: `Where` before `OrderBy` before `Select`. It
matters for both cost and correctness. Filtering first means sorting fewer
items. Projecting last means the ordering can still see fields the projection
throws away — try to sort by `Amount` after `Select(o => o.Customer)` and the
`Amount` is simply gone.

That is a genuine difference from SQL, where `ORDER BY` may reference columns
the `SELECT` list omits, because the database orders the *rows* before
projecting. In LINQ the pipeline is literal, so the order you write is the
order things happen.

`ThenBy` versus a second `OrderBy` is the most common LINQ ordering bug.
`OrderBy(a).OrderBy(b)` is not a two-key sort — it is a sort by `a`, thrown
away, then a sort by `b`. It compiles, it runs, and it silently gives the wrong
answer whenever there are ties. `.NET`'s sort is stable, which makes the wrong
version look right often enough to survive review.

## ex2

These operators are where a query stops being a query. Each one walks the
sequence until it can answer and then stops: `Any` returns on the first match,
`First` returns the first item, `All` returns on the first counterexample.
`Count` has to walk everything — unless the sequence is secretly an
`ICollection<T>`, in which case it asks for `.Count` and returns instantly, a
small optimisation worth knowing when someone claims `Count()` is O(n).

The `First`/`Single` distinction is a design statement about your data. `First`
says "there may be several; give me one". `Single` says "there is exactly one,
and if there is not, something upstream is broken". Using `Single` on a unique
key is self-documenting and gives you a loud failure at the right moment; using
`First` there hides a duplicate-key bug forever.

The `...OrDefault` variants are where lesson 07's `default(T)` trap returns.
`FirstOrDefault` on a sequence of `int` gives `0` when there was no match, which
is indistinguishable from a real `0`. That is why .NET 6 added an overload
taking an explicit default value, and why a nullable reference type is a
friendlier signature.

`All` over an empty sequence being `true` follows from the logic — "every
element satisfies p" is only false if you can produce an element that does not —
and it is a real source of bugs in validation code: `items.All(IsValid)` happily
approves an empty basket.

## ex3

This exercise is the reason lesson 10 exists in this course.

A LINQ query is a *plan*. The `CountingOrders` source in the gate makes that
observable: building the query touches nothing, and each enumeration walks the
source again. In memory that is a wasted loop. Against EF Core it is a second
`SELECT`. Against a network stream or a one-shot iterator it is either an
exception or, worse, silently different data.

The two production symptoms to recognise:

```csharp
if (query.Any()) { foreach (var x in query) { } }   // two executions
var count = query.Count(); var total = query.Sum(...); // two executions
```

Both are fixed the same way — materialise once at the point where you stop
composing and start consuming: `var results = query.ToList();`.

The mirror-image mistake is materialising too early: calling `.ToList()` in the
middle of a chain forces everything into memory and throws away the database's
chance to do the filtering. The rule of thumb: compose lazily, materialise once,
at the boundary.

The snapshot-versus-live pair is the other half. `Snapshot` is data and cannot
change; `Query` is a question re-asked every time. Neither is right in general,
and choosing without noticing is how a method ends up returning results that
depend on when the caller looked at them.

## ex4

`Skip` and `Take` are `OFFSET` and `LIMIT`, with the same well-known problem:
offset paging gets slower the deeper you go (the source still walks the skipped
items) and is unstable if the ordering has ties. The SQL course's lesson on
keyset pagination is the same critique with the same fix — order by something
unique and remember where you stopped, rather than counting from the start.

Ordering before taking is not a style preference. `Take` is deferred, so
`Take(3).OrderByDescending(...)` builds a pipeline that takes the first three
items *in source order* and then sorts those three. It produces a plausible
list of three orders that are simply not the biggest three. Errors like this
never throw; you find them when a report looks odd.

`OrderBy` buffering the whole sequence is worth remembering here too: `Take(3)`
after an `OrderBy` still sorts everything first. .NET's implementation is
smarter than a naive full sort for small takes, but the mental model — "sorting
reads everything" — is the one to keep.

## challenge

The pipeline is routine by now; the interesting line is the last one. LINQ hands
you an empty sequence for "no matches", `string.Join` hands you `""`, and
whether the *user* should see an empty line or the word "none" is a product
decision that no library can make.

That is a small instance of a large habit: the library's default for the empty
case is almost never the right answer for the user's. Empty baskets, months with
no sales, searches with no hits — every one of them needs a deliberate decision,
and every one of them is a bug report when nobody made it.

## review1

`Distinct` uses the element's `Equals` and `GetHashCode`, which is lesson 06's
contract turning up in a place you would not have predicted. Over a sequence of
`string` it does what you expect. Over a sequence of `Order` **records** it also
does what you expect, because records generate value equality. Over a sequence
of a plain class holding identical data it does nothing at all, because every
instance is distinct by reference — and that is the interview question hiding in
this exercise.

`DistinctBy` (since .NET 6) is the operator you actually want most of the time:
`orders.DistinctBy(o => o.Customer)` keeps the first order per customer without
any equality plumbing. Worth knowing it exists before you write a `GroupBy` to
fake it.

The laziness check on `LazyNames` is the ex3 point again in a smaller frame. If
you have started reaching for `.ToList()` reflexively to make the types line up,
this is the review catching that habit early: return type
`IEnumerable<string>` means "I am handing you a query", and the caller decides
when it runs.

## Further reading

- [LINQ overview](https://learn.microsoft.com/en-us/dotnet/csharp/linq/) — the concepts, with query syntax and method syntax side by side.
- [Standard query operators overview](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/) — the full catalogue, grouped by what they do.
- [Deferred execution and lazy evaluation](https://learn.microsoft.com/en-us/dotnet/standard/linq/deferred-execution-lazy-evaluation) — with the classification of which operators defer.
- [Classification of standard query operators by manner of execution](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/query-expression-syntax-for-standard-query-operators) — the deferred/immediate table worth bookmarking.
- [`IQueryable<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.iqueryable-1) — the other LINQ, and why expression trees exist.
