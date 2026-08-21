## Hint 1

Both handlers return `WidgetDto`, never `Widget`. That is the whole exercise —
the gate reads the raw response text and fails if the words `internalNotes` or
`revision` appear anywhere in it.

The cleanest way to guarantee that is to make the DTO the thing the *query*
produces, not something you convert to afterwards.

## Hint 2

Lesson 06's projection pattern:

```csharp
.Select(w => new WidgetDto(w.Id, w.Name, w.Sku, w.PriceCents))
```

Put that inside the `IQueryable` and the SQL only reads four columns; the leak
becomes impossible rather than merely avoided.

For the single-widget handler, `Where(w => w.Id == id)` then the same `Select`
then `FirstOrDefaultAsync()` gives you a `WidgetDto?` to null-check.

## Hint 3

```csharp
var widget = await db.Widgets
    .Where(w => w.Id == id)
    .Select(w => new WidgetDto(w.Id, w.Name, w.Sku, w.PriceCents))
    .FirstOrDefaultAsync();

return widget is null ? TypedResults.NotFound() : TypedResults.Ok(widget);
```

The list version is the same projection with an `OrderBy(w => w.Name)` and no
filter. Note `FirstOrDefaultAsync()` with no predicate here — the `Where` above
already did the filtering.
