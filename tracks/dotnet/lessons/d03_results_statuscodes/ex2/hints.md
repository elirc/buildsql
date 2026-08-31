## Hint 1

Two beats, in this order: reject the request, then write. The gate lists the
bookings at the end precisely to catch a validation check that runs *after* the
insert.

The success answer needs three things, not one: the status, the header, and the
body.

## Hint 2

`string.IsNullOrWhiteSpace` covers null, empty and "   " in one call, and both
fields need it.

`store.Add(...)` returns the created booking, and its `Id` is what the Location
is built from:

```csharp
return TypedResults.Created($"/d03/bookings/{booking.Id}", booking);
```

The two-argument overload sets the status, the `Location` header and the body
together — which is the whole point of using it rather than assembling a 201 by
hand.
