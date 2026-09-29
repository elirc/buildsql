@@PROMPT@@
## Exercise 3 - nulls, and who handles them

Edit `src/Lessons/V3CC05_SystemTextJson/Ex3.cs`.

Two converters for the same CLR type, differing only in who deals with `null`.

`UnixDateConverter : JsonConverter<DateOnly>` writes a date as Unix seconds at
midnight UTC and reads it back:

- `Write` -> `writer.WriteNumberValue(seconds)`.
- `Read` accepts `JsonTokenType.Number`; anything else is a `JsonException`.
- It does **not** set `HandleNull`, so it is never asked about null. Prove it
  with a counter: `UnixDateConverter.ReadCalls`.

`NullableUnixDateConverter : JsonConverter<DateOnly?>` sets
`public override bool HandleNull => true` and maps `null` to
`DateOnly.MinValue` on read, and `DateOnly.MinValue` back to `null` on write —
a legacy contract where "no date" is a sentinel on one side and an absent value
on the other.

`Reminder(string Title, DateOnly Due, DateOnly? Snoozed)` uses both.

```
Serialize(new Reminder("call", new DateOnly(2024, 1, 1), null))
  -> {"title":"call","due":1704067200,"snoozed":null}

Deserialize<Reminder>("{\"title\":\"x\",\"due\":0,\"snoozed\":null}")
  -> Reminder("x", 1970-01-01, DateOnly.MinValue)

UnixDateConverter.ReadCalls after a document whose "due" is null
  -> unchanged; the serializer threw before reaching the converter
```

```
uv run dojo test csharp v3cc05_system_text_json ex3
```
@@HINTS@@
## Hint 1

By default the serializer deals with `null` itself: it writes `null` for a null
reference or empty `Nullable<T>`, and on reading it produces null without ever
calling your converter. Your converter only sees real values — which is
convenient right up to the moment you need `null` to *mean* something.

## Hint 2

Opting in is one property:

```csharp
public override bool HandleNull => true;
```

Now your `Read` is called with `reader.TokenType == JsonTokenType.Null`, and
your `Write` is called with a null value. Both must handle it, because the
serializer has stopped doing so on your behalf.

## Hint 3

The date arithmetic is easier through `DateTime` than by hand:

```csharp
long seconds = new DateTimeOffset(date.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)
    .ToUnixTimeSeconds();
DateOnly back = DateOnly.FromDateTime(DateTimeOffset.FromUnixTimeSeconds(seconds).UtcDateTime);
```

`TimeSpan.Zero` is doing real work there: constructing a `DateTimeOffset` from
a `DateTime` with an unspecified kind uses the *local* offset, so on a machine
in Berlin your dates move by an hour. Decide where else UTC has to be forced.
@@IMPORTANT@@
## Hint 1

Start from the contract question: is "no date" absent, `null`, or a sentinel
value? All three appear in real systems, often in the same payload, and the
converter is where you translate between their convention and yours. Writing
that sentence down first tells you whether you need `HandleNull` at all.

## Hint 2

.NET 7 gave `DateOnly` and `TimeOnly` built-in converters, so a custom one is
now a deliberate choice about the wire format, not a workaround:

```json
{ "due": "2024-01-01" }     // built in: ISO 8601
{ "due": 1704067200 }        // yours: Unix seconds
```

If you control both ends, prefer the built-in. The custom converter is for when
somebody else already decided.

## Hint 3

`DateOnly.MinValue` as a sentinel is a design smell you are implementing on
purpose, because the legacy system on the other end requires it. Note in a
comment that the mapping is lossy — a genuine 1 January 0001 becomes null — and
say why that is acceptable here. Being able to name the flaw in a contract you
must nevertheless implement is the professional version of this skill.
@@REF@@
// v3cc05_system_text_json / ex3 - nulls, and who handles them.
// See lessons/v3cc05_system_text_json/README.md, "Exercise 3".

using System.Text.Json;
using System.Text.Json.Serialization;

namespace CSharpDojo.V3CC05_SystemTextJson;

public sealed record Reminder(string Title, DateOnly Due, DateOnly? Snoozed);

/// <summary>
/// Unix seconds at midnight UTC. HandleNull is left alone, so the serializer
/// deals with null itself and this converter only ever sees real values.
/// </summary>
public sealed class UnixDateConverter : JsonConverter<DateOnly>
{
    public static int ReadCalls { get; private set; }

    public static void ResetCounters() => ReadCalls = 0;

    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        ReadCalls++;

        if (reader.TokenType != JsonTokenType.Number)
        {
            throw new JsonException($"expected Number, found {reader.TokenType}");
        }

        return FromSeconds(reader.GetInt64());
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        ArgumentNullException.ThrowIfNull(writer);
        writer.WriteNumberValue(ToSeconds(value));
    }

    // TimeSpan.Zero, not the machine's offset: a DateTimeOffset built from an
    // unspecified DateTime uses the local offset, which moves every date by an
    // hour on a machine in Berlin.
    internal static long ToSeconds(DateOnly date) =>
        new DateTimeOffset(date.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero).ToUnixTimeSeconds();

    internal static DateOnly FromSeconds(long seconds) =>
        DateOnly.FromDateTime(DateTimeOffset.FromUnixTimeSeconds(seconds).UtcDateTime);
}

/// <summary>
/// The legacy contract: "no date" is null on the wire and DateOnly.MinValue in
/// the model. Lossy on purpose - a genuine 0001-01-01 round-trips to null -
/// which is acceptable only because no such date exists in this domain.
/// </summary>
public sealed class NullableUnixDateConverter : JsonConverter<DateOnly?>
{
    /// <summary>Opts in: without this the serializer never asks about null.</summary>
    public override bool HandleNull => true;

    public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return DateOnly.MinValue;
        }

        if (reader.TokenType != JsonTokenType.Number)
        {
            throw new JsonException($"expected Number or Null, found {reader.TokenType}");
        }

        return UnixDateConverter.FromSeconds(reader.GetInt64());
    }

    public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
    {
        ArgumentNullException.ThrowIfNull(writer);

        if (value is null || value == DateOnly.MinValue)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteNumberValue(UnixDateConverter.ToSeconds(value.Value));
    }
}
