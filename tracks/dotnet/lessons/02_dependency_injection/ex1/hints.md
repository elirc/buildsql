## Hint 1

Two separate jobs, and it is worth doing them in order. First make the endpoint
return the three values — that is three property reads and a `TypedResults.Ok`.
Run the gate; now the failures are about *values*, not about a 500.

Then read those failures. Two of them are about the same value appearing twice,
one is about two values that should differ.

## Hint 2

Translate each gate message into a sentence about time:

- "every request sees the same ticket" — how many of these should exist for the
  whole application?
- "two parameters in one request differ" — how many should exist per *ask*?

The registration methods are `AddSingleton`, `AddScoped` and `AddTransient`,
and only two of the three are needed here.

## Hint 3

The endpoint is:

```csharp
private static IResult GetTicket(ITicketSource source, IIdGenerator first, IIdGenerator second) =>
    TypedResults.Ok(new TicketResponse(source.Ticket, first.Value, second.Value));
```

For the registrations: `ITicketSource` is one object for the life of the
application, and `IIdGenerator` is a new object every time anyone resolves it.
Leave one of the two `AddTransient` lines exactly as it is.
