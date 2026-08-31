## Hint 1

Each decorator takes the next one in its constructor, so composing them is one
nested expression — and it reads inside-out, which is where the mistakes come
from.

Write down the required chain first: audit on the outside, uppercase in the
middle, core at the centre. Then build it from the centre out.

## Hint 2

A factory registration, because you are constructing the whole chain yourself:

```csharp
services.AddSingleton<IMessageSink>(sp => new AuditSink(
    new UppercaseSink(new CoreSink()),
    sp.GetRequiredService<IAuditTrail>()));
```

The trail comes from the provider — it is a registered singleton and the gate
reads the same instance the endpoint does.

Check yourself on the second assertion: the audit layer records what *it* was
handed. Because it is outside the uppercase layer, that is the original `hi`. If
your trail holds `HI`, the two layers are the wrong way round.
