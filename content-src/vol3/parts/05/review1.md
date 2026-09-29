@@PROMPT@@
## Review 1 - the converter correctness gauntlet

Edit `src/Lessons/V3CC05_SystemTextJson/Review1.cs`. The sector from the
reader's side: token discipline, which is invisible in a one-property test and
catastrophic in a real document.

`Range(int Low, int High)` is written as a two-element array: `[1, 10]`.

`RangeConverter : JsonConverter<Range>`:

- `Read` expects `StartArray`, two numbers, then `EndArray`, and must return
  positioned **on the `EndArray` token** — not before it, not after.
- Wrong token types, the wrong number of elements, or `Low > High` are all
  `JsonException`.
- `Write` validates first, then emits exactly one array — never a partial one.

`Bounds(Range Primary, Range Secondary, string Label)` is the type that catches
a mispositioned reader: get the position wrong in `Primary` and the failure
appears at `Secondary` or `Label`, which is why the gate deserialises an object
with a property *after* the converter's.

Then the diagnostics:

- `TokenAudit.PositionAfterRead(string json)` — deserialises a bare `Range` with
  a reader you drive yourself, and returns the `TokenType` the reader is left
  on after the converter returns. It must be `"EndArray"`.
- `TokenAudit.SurvivesTrailingProperty(string json)` — whether an object with a
  property after the range round-trips without throwing.
- `TokenAudit.NoPartialWrite(Range invalid)` — attempts to serialise an invalid
  range and returns the output produced, which must be empty rather than a
  half-written array.

```
Deserialize<Range>("[1,10]")                    -> Range(1, 10)
Deserialize<Range>("[10,1]")                    -> JsonException
Deserialize<Range>("[1]")                       -> JsonException
Deserialize<Range>("[1,2,3]")                   -> JsonException
Deserialize<Bounds>("{\"primary\":[1,2],\"secondary\":[3,4],\"label\":\"x\"}")
  -> works, and label is "x"
PositionAfterRead("[1,10]")                     -> "EndArray"
NoPartialWrite(new Range(5, 1))                 -> ""
```

```
uv run dojo test csharp v3cc05_system_text_json review1
```
@@HINTS@@
## Hint 1

The contract is a position, not a value: you are handed the reader on your
value's first token and must leave it on your value's last token. The
serializer then advances once, and lands exactly on whatever comes next. One
token off in either direction and the *next* property is misparsed, which is
why the bug never appears where it was written.

## Hint 2

Counting the reads for an array of two numbers:

```csharp
// on StartArray
reader.Read();  int low  = reader.GetInt32();   // now on the first number
reader.Read();  int high = reader.GetInt32();   // now on the second number
reader.Read();                                   // now on EndArray - stop here
if (reader.TokenType != JsonTokenType.EndArray) throw new JsonException("too many elements");
```

Three reads, and the last one is what leaves you on `EndArray`. A fourth would
consume the token after your value.

## Hint 3

For `NoPartialWrite`, the check is that nothing reaches the output at all — so
the validation must happen before the first `WriteStartArray`. Write the
invalid case first and watch what a badly-ordered converter produces: `[5`
followed by an exception, which leaves the caller with a stream containing an
unclosed array. Decide whether `Write` should throw `JsonException` or
`ArgumentException`, and justify it by asking who catches it.
@@IMPORTANT@@
## Hint 1

Test with a trailing property from the very first run. A converter tested only
on `"[1,10]"` on its own passes with almost any token handling, because there
is nothing after it to be corrupted. `{"primary":[1,2],"label":"x"}` is the
minimum honest test, and it is the one that fails.

## Hint 2

`reader.Skip()` is the escape hatch when you genuinely do not know a value's
shape:

```csharp
reader.Read();     // move onto the value
reader.Skip();     // move to that value's LAST token, nesting included
```

`Skip` leaves you exactly where the converter contract wants you, which is why
it composes so well with this rule. Hand-rolled depth counting does not.

## Hint 3

Think about the error messages. `JsonException` gets the JSON path attached by
the serializer, so `"expected two numbers"` becomes
`"expected two numbers. Path: $.secondary | LineNumber: 0 | BytePositionInLine:
28"`. That path is the entire diagnostic value of throwing the right type —
which is why a converter that throws `InvalidOperationException` produces bug
reports nobody can act on.
@@REF@@
// v3cc05_system_text_json / review1 - the converter correctness gauntlet.
// See lessons/v3cc05_system_text_json/README.md, "Review 1".

using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CSharpDojo.V3CC05_SystemTextJson;

public readonly record struct Range(int Low, int High);

public sealed record Bounds(Range Primary, Range Secondary, string Label);

/// <summary>
/// A range is [low, high] on the wire. The whole exercise is token
/// discipline: leave the reader on the value's LAST token, never one either
/// side of it.
/// </summary>
public sealed class RangeConverter : JsonConverter<Range>
{
    public override Range Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.StartArray)
        {
            throw new JsonException($"expected StartArray, found {reader.TokenType}");
        }

        int low = ReadNumber(ref reader);
        int high = ReadNumber(ref reader);

        // The third read lands on EndArray - and stops. A fourth would consume
        // whatever follows this value, and the failure would surface on the
        // next property instead of here.
        reader.Read();
        if (reader.TokenType != JsonTokenType.EndArray)
        {
            throw new JsonException("a range has exactly two numbers");
        }

        if (low > high)
        {
            throw new JsonException($"[{low}, {high}] is not a range: low exceeds high");
        }

        return new Range(low, high);
    }

    public override void Write(Utf8JsonWriter writer, Range value, JsonSerializerOptions options)
    {
        ArgumentNullException.ThrowIfNull(writer);

        // Validate before the first write: the writer has no undo, so a
        // half-written array cannot be retracted.
        if (value.Low > value.High)
        {
            throw new JsonException($"[{value.Low}, {value.High}] is not a range: low exceeds high");
        }

        writer.WriteStartArray();
        writer.WriteNumberValue(value.Low);
        writer.WriteNumberValue(value.High);
        writer.WriteEndArray();
    }

    private static int ReadNumber(ref Utf8JsonReader reader)
    {
        if (!reader.Read() || reader.TokenType != JsonTokenType.Number)
        {
            throw new JsonException($"expected a number, found {reader.TokenType}");
        }

        return reader.GetInt32();
    }
}

public static class TokenAudit
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Converters = { new RangeConverter() },
    };

    /// <summary>
    /// Drives the reader by hand so the converter's final position is
    /// observable - the thing an ordinary round-trip test cannot see.
    /// </summary>
    public static string PositionAfterRead(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);

        byte[] utf8 = Encoding.UTF8.GetBytes(json);
        Utf8JsonReader reader = new(utf8, isFinalBlock: true, state: default);
        reader.Read();   // onto StartArray

        RangeConverter converter = new();
        _ = converter.Read(ref reader, typeof(Range), Options);

        return reader.TokenType.ToString();
    }

    /// <summary>
    /// The minimum honest test: a property AFTER the converter's, which a
    /// mispositioned reader corrupts.
    /// </summary>
    public static bool SurvivesTrailingProperty(string json)
    {
        try
        {
            Bounds? bounds = JsonSerializer.Deserialize<Bounds>(json, Options);
            return bounds is not null && bounds.Label.Length > 0;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    /// <summary>Nothing may reach the output when validation fails.</summary>
    public static string NoPartialWrite(Range invalid)
    {
        using MemoryStream stream = new();
        using (Utf8JsonWriter writer = new(stream))
        {
            try
            {
                new RangeConverter().Write(writer, invalid, Options);
                writer.Flush();
            }
            catch (JsonException)
            {
                // Nothing was written, so nothing needs undoing.
            }
        }

        return Encoding.UTF8.GetString(stream.ToArray());
    }
}
