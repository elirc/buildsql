## Hint 1

Three lines and a null check. This is lesson 05's delete again, and it is short
on purpose — the interesting part of DELETE is the decision, not the code.

You cannot remove a row you have not loaded, which is also how you find out
whether it was there.

## Hint 2

`await db.Widgets.FindAsync(id)` gives you the entity or null. Null is the 404.

Otherwise `db.Widgets.Remove(widget)`, `await db.SaveChangesAsync()`, and
`TypedResults.NoContent()`.

Nothing extra is needed to make the second DELETE a 404: by then the row is
gone, so `FindAsync` returns null and the same branch handles it.

## Hint 3

```csharp
var widget = await db.Widgets.FindAsync(id);
if (widget is null)
{
    return TypedResults.NotFound();
}

db.Widgets.Remove(widget);
await db.SaveChangesAsync();
return TypedResults.NoContent();
```

Before moving on, be able to say why this API answers 404 on the second delete
while another might answer 204 — `reading.md` has the argument, and it is a
common interview follow-up.
