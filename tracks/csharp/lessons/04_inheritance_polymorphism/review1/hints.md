## Hint 1

Three tiny members, and the question behind each one is "must every subclass
answer this, or is there a sensible default?"

`Describe()` is written for you, in the base class, and you do not touch it. Read
it first — it tells you exactly which members your subclasses have to supply.

## Hint 2

`Wheels` is an abstract *property*, so an override is a property too:

```csharp
public override int Wheels => 4;
```

`Sound()` already has a base implementation, so `Car` can simply not mention
it. Only `Motorbike` replaces it, with `"brap"`.

## Hint 3

Nothing here needs a field, a constructor or a `base.` call — every override is
a single expression.

The decision left to you is whether `Car` should override `Sound()` to return
`"vroom"` explicitly. It would pass. It is also the kind of code that makes a
future reader wonder what is different about a car, so the gate's message about
"not overriding is a legitimate choice" is the answer being pointed at.
