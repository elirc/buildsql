## Hint 1

Four branches, and the order between two of them is the whole idea: the key is
checked, and a *replay* is answered, **before** the body is validated.

Think about why. A retry after a timeout may carry anything at all; the key says
"this is the same operation as before", and the operation already succeeded.

## Hint 2

Read the header with
`http.Headers["Idempotency-Key"].FirstOrDefault() ?? ""`; empty is the 400,
keyed `"Idempotency-Key"`.

`store.Keys` is a `ConcurrentDictionary<string, int>` mapping key → order id.
`TryGetValue` tells you whether this is a replay; if it is, `store.Find(id)` and
return it with `TypedResults.Ok` — a 200, because nothing was created this time.

Only after that do you validate `item`, place the order, and record
`store.Keys[key] = order.Id`.

## Hint 3

```csharp
if (store.Keys.TryGetValue(key, out int alreadyPlaced))
{
    var existing = store.Find(alreadyPlaced);
    return existing is null ? TypedResults.NotFound() : TypedResults.Ok(existing);
}

// … validate item …

var order = store.Add(request.Item);
store.Keys[key] = order.Id;
return TypedResults.Created($"/i2/review/orders/{order.Id}", order);
```

In production this needs three more things, and being able to list them is the
follow-up: keys expire, the key is recorded in the same transaction as the work,
and a key reused with a *different* body is an error rather than a silent replay.
