## Hint 1

Two lines: log, then return. The return is a `TypedResults.Ok` of a
`ShipResponse`, which is already declared for you.

The log line is the exercise, and there is exactly one way to write it that the
gate accepts — but it is also the way that reads worse to a C# programmer's
instincts, which is why the mistake is so common.

## Hint 2

Do **not** interpolate. `logger.LogInformation($"Order {id} shipped to {city}")`
compiles, renders correctly, and produces a log entry with no fields in it at
all.

Instead pass a template with named placeholders and the values as separate
arguments:

```csharp
logger.LogInformation("template with {Placeholder} in it", value);
```

The gate looks for properties called `OrderId` and `City`, so those are the two
placeholder names — placeholders become property names, and the convention is
PascalCase.

## Hint 3

```csharp
logger.LogInformation("Order {OrderId} shipped to {City}", id, city);
return TypedResults.Ok(new ShipResponse(id, city));
```

Placeholders bind by **position**, not by name: the first argument fills the
first placeholder whatever it is called. Swap `id` and `city` and it still
compiles, still renders something, and labels both values wrongly - a mistake
worth knowing about before you make it in production.
