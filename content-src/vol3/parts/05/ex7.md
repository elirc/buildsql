@@PROMPT@@
## Exercise 7 - streaming without materialising

Edit `src/Lessons/V3CC05_SystemTextJson/Ex7.cs`.

A payload is `{"generated":"...","events":[ {...}, {...}, ... ]}` with tens of
thousands of event objects. You need three numbers and one small list, and you
must not build a `List<Event>` of the whole thing.

`EventScanner.Scan(ReadOnlySpan<byte> utf8)` returns
`ScanResult(int Total, int Errors, long TotalBytes, IReadOnlyList<string>
ErrorIds)` by walking a `Utf8JsonReader`:

- `Total` — how many objects are in `events`.
- `Errors` — how many have `"level": "error"`.
- `TotalBytes` — the sum of every `"bytes"` number.
- `ErrorIds` — the `"id"` of each error event, in order, capped at 10 (stop
  collecting, keep counting).
- Any object in `events` that is not an object is a `JsonException`.
- Properties you do not care about — including nested objects and arrays — are
  stepped over with `reader.Skip()`.

`EventScanner.CountNaive(string json)` is the version that deserialises into
`List<Event>` and counts, kept so the gate can compare allocations.

```
Scan of a 3-event payload with one error
  -> ScanResult(3, 1, 4096, ["e2"])

Scan allocates a small fraction of what CountNaive allocates on 5,000 events.
```

The gate asserts both agree on the counts, and that `Scan` allocates less than
a tenth of what `CountNaive` does.

```
uv run dojo test csharp v3cc05_system_text_json ex7
```
@@HINTS@@
## Hint 1

The reader is a cursor: every `Read()` moves one token forward, and
`TokenType` tells you what you are on. A hand-written scan is a loop over that
cursor with a small amount of state — are we inside `events`, are we inside an
object, which property name did we just see.

## Hint 2

Two moves do most of the work:

```csharp
if (reader.TokenType == JsonTokenType.PropertyName && reader.ValueTextEquals("level"u8))
{
    reader.Read();
    isError = reader.ValueTextEquals("error"u8);
}
```

`ValueTextEquals` compares raw UTF-8 bytes with no string allocation, and the
`u8` literal is a UTF-8 constant baked in at compile time. `reader.GetString()`
would allocate on every property of every event.

## Hint 3

`Skip()` is the other one. Positioned on `StartObject` or `StartArray`, it
moves to that value's matching end token in one call, nesting included — which
is far more reliable than a hand-rolled depth counter, and it is the reason
your loop does not need to understand the shape of the events you ignore.
Decide where in your loop `Skip` belongs so that an unknown property with a
nested object does not desynchronise you.
@@IMPORTANT@@
## Hint 1

Ask what `Deserialize<Payload>` actually does with a 50 MB document: it builds
every object, every string and every list, all of them live at once, and most
of them are dropped a line later. Streaming is not a micro-optimisation here —
it is the difference between a steady worker and one that spikes into the large
object heap on every message.

## Hint 2

For a real stream rather than a span, the async form does the buffering for
you:

```csharp
await foreach (Event e in JsonSerializer.DeserializeAsyncEnumerable<Event>(stream, options))
{
    // one at a time; the whole array is never materialised
}
```

That is the right first choice when you *do* want the objects. The hand-written
reader is for when you want less than the objects — counts, a filter, one field.

## Hint 3

Cap the `ErrorIds` list but keep counting `Errors`. Those are two different
questions — "what failed" and "how bad is it" — and a cap that also stops the
counter turns a report into a lie. Decide what the cap should be a constant
named after, and make sure the eleventh error still increments the count.
@@REF@@
// v3cc05_system_text_json / ex7 - streaming without materialising.
// See lessons/v3cc05_system_text_json/README.md, "Exercise 7".

using System.Text.Json;

namespace CSharpDojo.V3CC05_SystemTextJson;

public sealed record Event(string Id, string Level, long Bytes);

public sealed record ScanResult(int Total, int Errors, long TotalBytes, IReadOnlyList<string> ErrorIds);

public static class EventScanner
{
    private const int MaxReportedErrorIds = 10;

    /// <summary>
    /// Walks the payload with a cursor, allocating only the strings it keeps.
    /// </summary>
    public static ScanResult Scan(ReadOnlySpan<byte> utf8)
    {
        Utf8JsonReader reader = new(utf8, isFinalBlock: true, state: default);

        int total = 0;
        int errors = 0;
        long totalBytes = 0;
        List<string> errorIds = new();

        // Find the "events" array, stepping over everything else.
        while (reader.Read())
        {
            if (reader.TokenType != JsonTokenType.PropertyName)
            {
                continue;
            }

            if (!reader.ValueTextEquals("events"u8))
            {
                reader.Read();
                reader.Skip();   // whole value, nesting included
                continue;
            }

            reader.Read();
            if (reader.TokenType != JsonTokenType.StartArray)
            {
                throw new JsonException($"'events' is {reader.TokenType}, not an array");
            }

            while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
            {
                if (reader.TokenType != JsonTokenType.StartObject)
                {
                    throw new JsonException($"an event is {reader.TokenType}, not an object");
                }

                total++;
                ReadEvent(ref reader, ref errors, ref totalBytes, errorIds);
            }

            break;
        }

        return new ScanResult(total, errors, totalBytes, errorIds);
    }

    private static void ReadEvent(
        ref Utf8JsonReader reader,
        ref int errors,
        ref long totalBytes,
        List<string> errorIds)
    {
        string? id = null;
        bool isError = false;

        while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)
        {
            if (reader.TokenType != JsonTokenType.PropertyName)
            {
                continue;
            }

            // ValueTextEquals compares raw UTF-8: no string is allocated for
            // property names we are only matching against.
            if (reader.ValueTextEquals("id"u8))
            {
                reader.Read();
                id = reader.GetString();
            }
            else if (reader.ValueTextEquals("level"u8))
            {
                reader.Read();
                isError = reader.ValueTextEquals("error"u8);
            }
            else if (reader.ValueTextEquals("bytes"u8))
            {
                reader.Read();
                totalBytes += reader.GetInt64();
            }
            else
            {
                reader.Read();
                reader.Skip();   // unknown property: step over it whole
            }
        }

        if (!isError)
        {
            return;
        }

        // The cap limits the report, never the count: "what failed" and "how
        // bad is it" are different questions.
        errors++;
        if (id is not null && errorIds.Count < MaxReportedErrorIds)
        {
            errorIds.Add(id);
        }
    }

    /// <summary>The version that builds everything, kept as the baseline.</summary>
    public static int CountNaive(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);

        using JsonDocument document = JsonDocument.Parse(json);
        List<Event> events = document.RootElement
            .GetProperty("events")
            .Deserialize<List<Event>>(Contract.Json) ?? new List<Event>();

        return events.Count;
    }
}
