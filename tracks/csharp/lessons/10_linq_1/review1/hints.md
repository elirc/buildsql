## Hint 1

Two methods, and they differ in exactly the way ex3 was about: one ends with
`ToList()` and one deliberately does not.

`CategoriesOver` filters, projects to the category name, removes duplicates,
sorts, and materialises. `LazyNames` projects and stops.

## Hint 2

`Distinct()` is the LINQ operator for "each value once" — it is `SELECT
DISTINCT`, and like SQL's it works on the *projected* values, so project first
and then distinct.

```csharp
orders
    .Where(...)
    .Select(order => order.Category)
    .Distinct()
    .OrderBy(category => category)
    .ToList();
```

`LazyNames` is a single `Select` with no `ToList` — the return type is
`IEnumerable<string>` for exactly that reason.

## Hint 3

Order matters between `Distinct` and `OrderBy` in principle, though not for the
answer here: distinct-then-sort sorts fewer items. In SQL the planner would
make that decision for you; in LINQ-to-objects the order you write is the order
it runs, which is worth remembering whenever a step is expensive.

The gate checks that `LazyNames` reads nothing until enumerated. If you added a
`ToList()` to make the types line up, the compiler was happy and the gate will
not be.

Left to you: `Distinct()` uses the element's `Equals`/`GetHashCode` — lesson
06's contract, again. Ask yourself what `Distinct()` would do on a sequence of
`Order` records versus a sequence of a plain class holding the same data, and
you have answered a common interview question.
