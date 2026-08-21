## Hint 1

Two different jobs. `Longest` folds a whole sequence down to one value with
`Aggregate`. `CitiesByCustomerCount` is ex1's grouping again, written in the
*other* LINQ syntax.

`Aggregate` is the general case of `Sum`, `Count`, `Min` and `Max` — the one
you reach for when the fold you want does not already have a name.

## Hint 2

The seedless `Aggregate` takes the first element as the starting value and then
calls your lambda for each remaining one:

```csharp
words.Aggregate((best, word) => /* whichever should survive */)
```

Query syntax for the second one:

```csharp
from customer in customers
group customer by customer.City into city
orderby /* ... */
select $"{city.Key}: {city.Count()}"
```

`into` names the grouped result so the rest of the query can work with it, and
the whole `from ... select` expression is an `IEnumerable<string>` you can
`.ToList()` — put the query in parentheses to call it.

## Hint 3

The empty case is the interesting one. Seedless `Aggregate` throws
`InvalidOperationException` on an empty sequence because there is nothing to
start from — and the gate wants that, not a `""`. If you want a different
answer, the three-argument overload takes an explicit seed and never throws;
choosing between them is a real decision about whether "no items" is an error.

`orderby a descending, b` in query syntax is `OrderByDescending(a).ThenBy(b)` —
the comma is the `ThenBy`, exactly as in SQL.

Left to you: whether to call `city.Count()` twice (once in `orderby`, once in
`select`) or project to an intermediate. Twice is clearer and walks each group
twice; over a database, the translator would collapse them anyway.
