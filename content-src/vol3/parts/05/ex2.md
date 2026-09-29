@@PROMPT@@
## Exercise 2 - a converter for a value type

Edit `src/Lessons/V3CC05_SystemTextJson/Ex2.cs`.

`readonly record struct Money(string Currency, decimal Amount)` is written on
the wire as a single string: `"GBP 12.34"` — three-letter uppercase currency, a
space, and the amount with exactly two decimal places.

`MoneyConverter : JsonConverter<Money>`:

- `Read` accepts only `JsonTokenType.String`; anything else is a
  `JsonException` naming the token type it found.
- A string that is not `"XXX 0.00"`-shaped — no space, a currency that is not
  three letters, an unparseable amount — is a `JsonException` quoting the value.
- `Write` emits `writer.WriteStringValue($"{Currency} {Amount:0.00}")`, and
  validates the currency before writing anything.
- Amounts parse and format with `CultureInfo.InvariantCulture`, always.

```
Serialize(new Money("GBP", 12.5m))          -> "GBP 12.50"   (quoted, two decimals)
Deserialize<Money>("\"USD 3\"")             -> Money("USD", 3m)
Deserialize<Money>("\"USD\"")               -> JsonException "'USD' is not a money value"
Deserialize<Money>("12.50")                 -> JsonException "expected String, found Number"
Deserialize<Invoice>("{\"total\":\"GBP 5.00\"}")  -> works through a property
```

`Invoice(string Id, Money Total)` exists so the gate can check the converter
inside an object, where the reader is positioned by the serializer rather than
by the test.

```
uv run dojo test csharp v3cc05_system_text_json ex2
```
@@HINTS@@
## Hint 1

A converter is two halves of one decision: what this type looks like on the
wire. Write the `Write` half first — it is three lines and it fixes the format —
then make `Read` accept exactly what `Write` produces, and nothing else.

## Hint 2

The reader arrives already positioned on your value's first token, so a scalar
converter does not call `Read()` at all:

```csharp
public override Money Read(ref Utf8JsonReader reader, Type _, JsonSerializerOptions o)
{
    if (reader.TokenType != JsonTokenType.String)
        throw new JsonException($"expected String, found {reader.TokenType}");

    string text = reader.GetString()!;
    ...
    // return without advancing: you must leave the reader on the LAST token
    // of your value, which for a scalar is the one you started on
}
```

## Hint 3

Throw `JsonException` and nothing else. The serializer catches it and attaches
the JSON path, so the caller learns it was `items[3].total` rather than "a
format exception, somewhere". Decide how strict to be about the currency —
three uppercase letters is a rule you can enforce cheaply, and enforcing it in
`Write` as well as `Read` stops you emitting a document you would refuse to
read.
@@IMPORTANT@@
## Hint 1

Ask why `Money` needs a converter at all when a `{ "currency": ..., "amount":
... }` object would serialise for free. The answer is that the format is not
yours: a partner system, a legacy database or a specification has already
decided, and the converter is the adapter between their contract and your type.
That framing tells you when a converter is warranted and when it is
over-engineering.

## Hint 2

Culture is not optional here:

```csharp
decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out decimal amount);
value.Amount.ToString("0.00", CultureInfo.InvariantCulture);
```

A machine running under a German locale formats `12.50` as `12,50`, which is a
different document. Wire formats are always invariant; a serializer that
depends on the machine's locale produces payloads that fail in one data centre
and not another.

## Hint 3

Validate before you write. `Utf8JsonWriter` has no undo — once you have written
part of a value the document is already malformed — so a `Write` that checks the
currency after emitting the string is a converter that can produce broken JSON.
Decide what `Write` should do with an invalid `Money` and be able to justify
throwing over silently correcting it.
@@REF@@
// v3cc05_system_text_json / ex2 - a converter for a value type.
// See lessons/v3cc05_system_text_json/README.md, "Exercise 2".

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CSharpDojo.V3CC05_SystemTextJson;

public readonly record struct Money(string Currency, decimal Amount);

public sealed record Invoice(string Id, Money Total);

/// <summary>
/// Money on the wire is "GBP 12.34": one string, invariant culture, two
/// decimal places. The converter is the adapter between somebody else's
/// contract and our type.
/// </summary>
public sealed class MoneyConverter : JsonConverter<Money>
{
    public override Money Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.String)
        {
            // JsonException, not FormatException: the serializer catches this
            // and attaches the JSON path, so the caller learns it was
            // items[3].total rather than "somewhere in the document".
            throw new JsonException($"expected String, found {reader.TokenType}");
        }

        string text = reader.GetString() ?? throw new JsonException("expected a money value, found null");

        int space = text.IndexOf(' ');
        if (space <= 0 ||
            !IsCurrency(text.AsSpan(0, space)) ||
            !decimal.TryParse(
                text.AsSpan(space + 1),
                NumberStyles.Number,
                CultureInfo.InvariantCulture,
                out decimal amount))
        {
            throw new JsonException($"'{text}' is not a money value");
        }

        // No Read() call: a scalar converter must leave the reader on the same
        // token it started on, which is this value's last token.
        return new Money(text[..space], amount);
    }

    public override void Write(Utf8JsonWriter writer, Money value, JsonSerializerOptions options)
    {
        ArgumentNullException.ThrowIfNull(writer);

        // Validate before writing anything: Utf8JsonWriter has no undo, so a
        // half-written value is a malformed document.
        if (value.Currency is null || !IsCurrency(value.Currency))
        {
            throw new JsonException($"'{value.Currency}' is not a currency code");
        }

        writer.WriteStringValue(
            $"{value.Currency} {value.Amount.ToString("0.00", CultureInfo.InvariantCulture)}");
    }

    private static bool IsCurrency(ReadOnlySpan<char> code)
    {
        if (code.Length != 3)
        {
            return false;
        }

        foreach (char c in code)
        {
            if (!char.IsAsciiLetterUpper(c))
            {
                return false;
            }
        }

        return true;
    }
}
