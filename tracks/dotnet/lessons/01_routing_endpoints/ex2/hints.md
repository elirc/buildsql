## Hint 1

Two jobs. First, `MapEndpoints` is empty — until you map something, both routes
are 404s, which is what the gate is telling you. Second, the two handlers need
bodies.

Start with the mapping, run the gate, and watch the failure change from 404 to
500. A moving failure is progress.

## Hint 2

`app.MapGroup("/l01/customers")` gives you a builder. Map the list handler on
the group's own root — the pattern for that is the empty string, because the
group already supplied the prefix — and the second one on `"/{name}/orders"`.

For `ListCustomers`, the pipeline is: take every order's customer, remove
duplicates, sort. LINQ has one method for each of those three words.

For `OrdersFor`, filter by name and order by id — then decide what "nobody has
that name" means. The gate says 404, so you need to look at the result before
you return it.

## Hint 3

The mapping is:

```csharp
var customers = app.MapGroup("/l01/customers");
customers.MapGet("", ListCustomers);
customers.MapGet("/{name}/orders", OrdersFor);
```

`ListCustomers` is one LINQ chain ending in `.ToList()`, wrapped in
`TypedResults.Ok(...)`. Use `StringComparer.Ordinal` in `OrderBy` if you want
the sort to be independent of the machine's locale.

`OrdersFor` materialises the filtered list first, then returns
`TypedResults.NotFound()` when `orders.Count == 0`. Note it is the *empty
result*, not a missing customer record, that tells you the customer does not
exist — there is no customer table in this lesson.
