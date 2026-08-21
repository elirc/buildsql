## Hint 1

Two of these three methods are one line, and the difference between them is a
single call. The third is deliberately not LINQ at all.

`Query` must hand back the query itself — unrun. `Snapshot` must run it once,
now, and keep the results. `CountAndTotal` must produce two numbers from **one**
walk of the sequence.

## Hint 2

`orders.Where(...)` returns an `IEnumerable<Order>` and reads nothing until
somebody enumerates it. That is `Query`, complete.

Adding `.ToList()` is what runs it: one pass over the source, results copied
into a list you own. That is `Snapshot`.

`CountAndTotal` is the interesting one. `orders.Count()` walks the sequence and
`orders.Sum(o => o.Amount)` walks it again — the gate counts enumerations and
will see the second walk. Write a `foreach` and accumulate both.

## Hint 3

The gate tells the whole story if you read its assertions in order: the query
that reads nothing, the same query counted twice reading the source twice, the
snapshot that is immune to a later `Add`, and the live query that is not.

That last pair is the point. Two lines of code that differ only by `.ToList()`
have completely different semantics: one is a *plan* re-run on demand against
whatever the source holds at that moment, the other is *data*.

Left to you: `CountAndTotal` could also be done by materialising once
(`var list = orders.ToList();`) and then using LINQ twice on the list. That is
one enumeration of the source and perfectly defensible — the gate accepts it.
Deciding between "one pass, no allocation" and "one pass, then convenience" is
the real judgement call.
