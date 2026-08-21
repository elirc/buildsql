## Hint 1

Load first, validate second, assign third. Loading first is what gives you the
404 before you spend any effort on a request aimed at nothing.

The validation block is the same one you wrote in ex2 — copy it, or better,
notice how much you want to extract it and resist for now.

## Hint 2

The assignment step is where the exercise bites. There are exactly three fields
a client is allowed to set, and you assign exactly those three onto the entity
you loaded:

```csharp
widget.Name = request.Name!;
widget.Sku = request.Sku!;
widget.PriceCents = request.PriceCents;
```

You do not build a new `Widget`, you do not call `Update`, and you never touch
`InternalNotes`. The change tracker turns those three assignments into an
`UPDATE` of three columns.

Then `await db.SaveChangesAsync()` and `TypedResults.NoContent()`.

## Hint 3

Idempotency needs no code at all — it falls out of "assign these three fields".
Send the same body twice and the second `SaveChangesAsync` finds nothing
changed, writes nothing, and you still return 204.

If the gate says `InternalNotes` was wiped, you replaced the entity instead of
editing it. If it says the second PUT was not a 204, you added a "has this
changed" check that returns a different code — take it out; sameness is success.
