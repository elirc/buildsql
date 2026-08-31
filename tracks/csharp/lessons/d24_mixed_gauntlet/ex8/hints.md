## Hint 1

Two fields, because neither structure gives you both things you need: a
`Dictionary<int, Employee>` for lookup by id, and a `List<int>` for insertion
order. Every method has to keep them agreeing.

Write down what each method does to *both* before you write any of them.

## Hint 2

`Save`: add the id to the order list only when it is new, then set the
dictionary entry either way, then raise. That is what makes a replace keep the
employee's original position.

`Get`: `TryGetValue`, and `KeyNotFoundException` when it says no - not null,
because a null forces every caller to check and most of them will not.

`Query` and `DeptTotals` both start from the order list and look each id up, so
they inherit insertion order:

```csharp
_order.Select(id => _byId[id])
```

## Hint 3

`Remove` is where this design goes wrong most easily. Removing the dictionary
entry and forgetting the order list leaves an id in `_order` that `_byId` no
longer has - and then `_byId[id]` throws inside `Query`, or worse, a version
that skips missing ids gives you totals that are right and queries that are
not. The gate checks the totals *after* a removal for exactly that reason.

`Dictionary.Remove` returns whether it removed anything, which is the value the
method wants anyway - so one call answers the question and does the work.

For the totals, format with `CultureInfo.InvariantCulture`. Decide for yourself
whether `DeptTotals` should include a department whose only employee has just
been removed; the grouping answers that for you, and it is worth noticing which
way.
