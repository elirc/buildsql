## Hint 1

Five one-liners. Each one is a LINQ operator that ends the query and returns an
answer rather than another sequence — these are the *greedy* operators, and
each has a matching idea in SQL: `Any` is `EXISTS`, `Count` is `count(*)`,
`First` is `LIMIT 1`.

The interesting decisions are the ones about what happens when there is no
match, or more than one.

## Hint 2

Every one of these takes an optional predicate, so you rarely need a `Where`
first:

```csharp
orders.FirstOrDefault(order => order.Category == category)
orders.Any(order => order.Amount > amount)
orders.All(order => order.Amount < amount)
orders.Count(order => order.Category == category)
orders.Single(order => order.Id == id)
```

`First` throws when there is no match; `FirstOrDefault` returns `null` for a
reference type. `Single` throws when there is not **exactly** one — including
when there are two.

## Hint 3

Two behaviours the gate checks that are worth predicting first.

`All` over an empty sequence is **true**. There is no counterexample, so the
statement holds vacuously. Every language does this; it still catches people.

`Single` throwing is a feature, not something to work around. The prompt says
ids are unique, so "no match" and "two matches" both mean the data or the
caller is wrong, and a loud `InvalidOperationException` at the point of the
mistake beats a quiet `null` that fails three methods later.

Left to you: whether `AnyOver` should use `>` or `>=`. Read the gate's two
assertions about 250 and 300 and let them decide it.
