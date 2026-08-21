## Hint 1

Write the naive version first: `FirstOrDefaultAsync(c => c.Id == id)`, build the
`CustomerDetail`, run the gate. The orders list comes back empty, and nothing
told you it would. That silence is the lesson.

Then ask EF for the related rows explicitly.

## Hint 2

`Include(c => c.Orders)` on the query brings the collection navigation back with
the parent, in one SQL statement with a join.

After that, `customer.Orders` is a real `List<Order>` in memory, so the sorting
and the mapping to `OrderSummary` are ordinary LINQ-to-objects on it.

The null check on the customer has to come before you touch `.Orders`.

## Hint 3

```csharp
var customer = await db.Customers
    .Include(c => c.Orders)
    .FirstOrDefaultAsync(c => c.Id == id);

if (customer is null) { return TypedResults.NotFound(); }

var orders = customer.Orders
    .OrderBy(o => o.Id)
    .Select(o => new OrderSummary(o.Id, o.Reference))
    .ToList();
```

A projection with `Select` straight out of the database would work here too, and
would fetch fewer columns. Try that version afterwards and compare the SQL.
