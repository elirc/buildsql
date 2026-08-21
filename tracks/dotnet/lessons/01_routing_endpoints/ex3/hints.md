## Hint 1

Validate first, then build. Two things can be wrong with the request — a blank
customer and a non-positive total — and both are 400s, so one guard with an
`||` covers them.

After that you are constructing an `Order` and handing it back with a status
code that is not 200.

## Hint 2

`Catalog.NextOrderId` gives you the id. The status is not taken from the
request at all: a new order is `"pending"`, full stop.

The 201 helper takes two arguments — the URL where the new thing lives, and the
body. Build the URL with interpolation from the id you just used, so the two
can never disagree.

## Hint 3

The shape is:

```csharp
if (string.IsNullOrWhiteSpace(request.Customer) || /* the total check */)
{
    return TypedResults.BadRequest();
}

var order = new Order(/* id */, request.Customer, /* status */, request.TotalCents);
return TypedResults.Created($"/l01/orders/{order.Id}", order);
```

The gate wants the `Location` header to be exactly `/l01/orders/6` — a relative
URL, no scheme, no host. And note that after the guard the compiler knows
`request.Customer` is not null, so it fits the `string` parameter without a `!`.
