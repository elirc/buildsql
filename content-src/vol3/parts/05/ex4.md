@@PROMPT@@
## Exercise 4 - polymorphism and the discriminator

Edit `src/Lessons/V3CC05_SystemTextJson/Ex4.cs`.

`Payment` is an abstract base with two derived types, discriminated on the wire
by a `"kind"` property with values you choose — never type names, because a
class rename must not be a wire break.

```csharp
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(CardPayment), "card")]
[JsonDerivedType(typeof(BankPayment), "bank")]
public abstract class Payment { public required decimal Amount { get; init; } }
```

`CardPayment` adds `required string Last4`; `BankPayment` adds
`required string Sort` and `required string Account`.

The built-in reader requires the discriminator to come **first**. So also
write `LenientPaymentConverter : JsonConverter<Payment>` for the partner
system whose payload puts `kind` wherever it likes:

- Buffer the object with `JsonDocument.ParseValue(ref reader)` — a deliberate
  cost, taken because the reader is forward-only.
- Find `kind` anywhere in the object; a missing or unknown `kind` is a
  `JsonException`.
- Deserialise the buffered element into the resolved concrete type.
- `Write` delegates to the built-in polymorphic behaviour by serialising the
  runtime type.
- Dispose the `JsonDocument`.

```
Serialize<Payment>(new CardPayment { Amount = 10m, Last4 = "4242" })
  -> {"kind":"card","amount":10,"last4":"4242"}

Deserialize<Payment>("{\"kind\":\"bank\",\"amount\":5,\"sort\":\"01-02-03\",\"account\":\"12345678\"}")
  -> BankPayment

// built-in support, discriminator not first:
Deserialize<Payment>("{\"amount\":5,\"kind\":\"card\",\"last4\":\"1111\"}")
  -> JsonException

// with the lenient converter registered:
  -> CardPayment { Amount = 5, Last4 = "1111" }
```

```
uv run dojo test csharp v3cc05_system_text_json ex4
```
@@HINTS@@
## Hint 1

The reader is forward-only: it must know which type to construct before it
starts assigning members, and it cannot look ahead without buffering. That
single constraint explains the discriminator-first rule, and it explains why
the lenient version has to buffer.

## Hint 2

Buffering is one call, and the buffer is disposable:

```csharp
using JsonDocument document = JsonDocument.ParseValue(ref reader);
JsonElement root = document.RootElement;
if (!root.TryGetProperty("kind", out JsonElement kind))
    throw new JsonException("no 'kind' discriminator");
```

`ParseValue` consumes exactly one value from the reader and leaves it on that
value's last token — which is precisely the converter contract, so you do not
need to advance afterwards.

## Hint 3

Deserialising the buffered element into the concrete type is
`root.Deserialize<CardPayment>(options)` — but be careful: if the options still
have your lenient converter registered for `Payment`, deserialising into the
*derived* type is fine, because the converter is registered for the base. Ask
yourself what would happen if you deserialised into `Payment` again, and why
that is the infinite loop everyone writes once.
@@IMPORTANT@@
## Hint 1

Choose the discriminator values before writing any code, and write down why
they are what they are. `"card"` and `"bank"` are stable, readable and
independent of your class names. `nameof(CardPayment)` is none of those things,
and the day somebody renames the class to `CardPaymentV2` the wire format
changes without a single test failing.

## Hint 2

The built-in support has a second knob worth knowing:

```csharp
[JsonPolymorphic(
    TypeDiscriminatorPropertyName = "kind",
    UnknownDerivedTypeHandling = JsonUnknownDerivedTypeHandling.FailSerialization)]
```

The default fails when you serialise a derived type that was never declared,
which is the safe behaviour: silently serialising it as the base would drop
every derived property.

## Hint 3

Weigh the buffering honestly. `JsonDocument.ParseValue` materialises the whole
object before you deserialise it, so you pay memory proportional to the value
and lose the streaming property. That is the right trade when the format is not
yours; it would be the wrong one if you controlled both ends and could simply
put the discriminator first. Say which situation you are in.
@@REF@@
// v3cc05_system_text_json / ex4 - polymorphism and the discriminator.
// See lessons/v3cc05_system_text_json/README.md, "Exercise 4".

using System.Text.Json;
using System.Text.Json.Serialization;

namespace CSharpDojo.V3CC05_SystemTextJson;

/// <summary>
/// Discriminator values are chosen strings, never type names: a class rename
/// must not be a breaking change to the wire format.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(CardPayment), "card")]
[JsonDerivedType(typeof(BankPayment), "bank")]
public abstract class Payment
{
    public required decimal Amount { get; init; }
}

public sealed class CardPayment : Payment
{
    public required string Last4 { get; init; }
}

public sealed class BankPayment : Payment
{
    public required string Sort { get; init; }

    public required string Account { get; init; }
}

/// <summary>
/// For a partner whose payload puts "kind" anywhere. Buffers the object
/// deliberately - the reader is forward-only, so leniency costs memory
/// proportional to the value and gives up streaming.
/// </summary>
public sealed class LenientPaymentConverter : JsonConverter<Payment>
{
    public override Payment Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // ParseValue consumes exactly one value and leaves the reader on its
        // last token, which is already the converter contract.
        using JsonDocument document = JsonDocument.ParseValue(ref reader);
        JsonElement root = document.RootElement;

        if (root.ValueKind != JsonValueKind.Object)
        {
            throw new JsonException($"expected an object, found {root.ValueKind}");
        }

        if (!root.TryGetProperty("kind", out JsonElement kind) || kind.ValueKind != JsonValueKind.String)
        {
            throw new JsonException("no 'kind' discriminator");
        }

        // Deserialise into the CONCRETE type: going back to Payment here would
        // re-enter this converter forever.
        return kind.GetString() switch
        {
            "card" => root.Deserialize<CardPayment>(options)
                ?? throw new JsonException("card payment was null"),
            "bank" => root.Deserialize<BankPayment>(options)
                ?? throw new JsonException("bank payment was null"),
            string other => throw new JsonException($"unknown kind '{other}'"),
            null => throw new JsonException("no 'kind' discriminator"),
        };
    }

    public override void Write(Utf8JsonWriter writer, Payment value, JsonSerializerOptions options)
    {
        ArgumentNullException.ThrowIfNull(writer);
        ArgumentNullException.ThrowIfNull(value);

        // Serialise the runtime type so the built-in polymorphic writer emits
        // the discriminator and the derived properties.
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
    }
}
