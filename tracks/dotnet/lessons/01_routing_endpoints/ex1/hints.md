## Hint 1

`Catalog.Orders` is an ordinary `IReadOnlyList<Order>`, so this is a LINQ
problem wearing a web-framework hat: find the one element whose `Id` matches,
then decide what to return when there isn't one.

The route already parsed the id into an `int` for you. You do not need to touch
the template.

## Hint 2

`FirstOrDefault` returns `null` when nothing matches, which is exactly the
signal you need for the 404. `First` would throw, and a thrown exception is a
500 — the wrong answer to "there is no order 99".

Two results, one expression: a conditional (`cond ? a : b`) whose branches are
`TypedResults.NotFound()` and `TypedResults.Ok(order)` is legal here because
both convert to the declared `IResult`.

## Hint 3

The shape is:

```csharp
private static IResult GetOrder(int id)
{
    var order = Catalog.Orders.FirstOrDefault(/* which one? */);
    return order is null ? /* … */ : /* … */;
}
```

Return the `order` object itself; the serialiser turns the record into
`{"id":…,"customer":…,"status":…,"totalCents":…}` with no help from you.
