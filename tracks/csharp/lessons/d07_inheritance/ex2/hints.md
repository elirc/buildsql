## Hint 1

`base.Format(message)` calls the version one level up, *non-virtually* - so
from `ShoutingLogger` it reaches `TimestampLogger`'s override, and from there
`base.Format` reaches `Logger`'s.

Each override should do its own one job and delegate the rest.

## Hint 2

```csharp
public override string Format(string message) => $"[{Stamp}] " + base.Format(message);
```

and then

```csharp
public override string Format(string message) => base.Format(message).ToUpperInvariant();
```

Work out the expected answer for `new ShoutingLogger("t").Format("hi")` before
you run it: the shouting layer upper-cases what the timestamp layer produced,
so the stamp is inside the shouting and comes out as `[T] HI`. If you expected
`[t] HI` you were imagining the layers the other way round - which is exactly
the thing worth getting straight.

`base` always means "one step up from the class this code is written in" - it
is fixed at compile time and does not follow the runtime type.
