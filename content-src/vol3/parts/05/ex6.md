@@PROMPT@@
## Exercise 6 - versioning a contract

Edit `src/Lessons/V3CC05_SystemTextJson/Ex6.cs`.

One model that reads documents written by v1 and v2 producers, and writes v2.

`ShipmentDto`:

- `required string Id` — present since v1, so `required` is legitimate.
- `string? Carrier` — added in v2, nullable.
- `int Priority { get; init; } = 5` — added in v2, defaulted.
- `[JsonPropertyName("ref")] string Reference` — the wire name was chosen
  before the property was renamed, and must not change.
- `[JsonExtensionData] Dictionary<string, JsonElement>? Unknown` — everything
  this version does not understand, kept for the round trip.

`Versioning`:

- `Read(string json)` -> `ShipmentDto`, tolerantly: unknown members are
  captured, missing v2 members take their defaults, a missing `Id` is a
  `JsonException`.
- `Write(ShipmentDto dto)` -> the v2 shape, plus whatever was captured.
- `DetectVersion(string json)` -> `"v1"` when there is no `carrier` property,
  `"v2"` when there is.

```
Read("{\"id\":\"S1\",\"ref\":\"AB\"}")
  -> Id "S1", Carrier null, Priority 5, Unknown empty or null

Read("{\"id\":\"S1\",\"ref\":\"AB\",\"legacyDepot\":\"D9\"}")
  -> Unknown contains legacyDepot
Write(that)
  -> {"id":"S1","ref":"AB","priority":5,"legacyDepot":"D9"}    // nothing lost

Read("{\"ref\":\"AB\"}")   -> JsonException (Id is required)
DetectVersion("{\"id\":\"S1\",\"carrier\":\"DHL\"}")   -> "v2"
```

The gate round-trips a v1 document with two unknown members and asserts both
survive.

```
uv run dojo test csharp v3cc05_system_text_json ex6
```
@@HINTS@@
## Hint 1

The rule is asymmetric and worth saying out loud: **read tolerantly, write
strictly**. Reading must survive a producer newer than you; writing must emit
exactly today's shape. Every design decision here is one of those two
sentences applied to a specific member.

## Hint 2

Extension data is one attribute and one dictionary:

```csharp
[JsonExtensionData]
public Dictionary<string, JsonElement>? Unknown { get; set; }
```

On read it collects every member with no matching property; on write it emits
them back at the top level. That is what makes a middle-tier service safe to
put between two systems it does not fully understand — without it, your service
silently deletes fields belonging to somebody else's contract.

## Hint 3

`required` is the trap. It means "this document is invalid without it", which
is true only for members that existed in the very first version — put it on a
v2 addition and every v1 document is rejected. Decide, member by member,
whether it was there from the start, and note that `required` and a default
value are mutually exclusive by intent: one says "the producer must send it",
the other says "we can carry on without it".
@@IMPORTANT@@
## Hint 1

Think about the four kinds of change and which are safe. Adding an optional
member: safe both ways. Removing a member: breaks consumers that read it.
Renaming: breaks everyone unless the wire name is pinned. Changing a type —
string to number, scalar to array — breaks everyone, always, and needs a new
property name instead.

## Hint 2

`[JsonPropertyName]` is how a CLR rename stops being a wire change:

```csharp
[JsonPropertyName("ref")]
public required string Reference { get; init; }
```

The property can be renamed freely from here on; the wire name is frozen. Every
public DTO benefits from having its names pinned explicitly, because it turns
an accidental breaking change into an impossible one.

## Hint 3

`DetectVersion` should look at the document, not at the model — parse with
`JsonDocument` and test for the property's presence. Decide what it should say
about a document that has `carrier` but is missing `ref`: version detection and
validation are different jobs, and conflating them gives you a method that
cannot answer either question cleanly.
@@REF@@
// v3cc05_system_text_json / ex6 - versioning a contract.
// See lessons/v3cc05_system_text_json/README.md, "Exercise 6".

using System.Text.Json;
using System.Text.Json.Serialization;

namespace CSharpDojo.V3CC05_SystemTextJson;

/// <summary>
/// Read tolerantly, write strictly. Every member below is one of those two
/// sentences applied to a specific field.
/// </summary>
public sealed class ShipmentDto
{
    /// <summary>Present since v1, so required is legitimate here.</summary>
    public required string Id { get; init; }

    /// <summary>The CLR name may change; the wire name is frozen.</summary>
    [JsonPropertyName("ref")]
    public required string Reference { get; init; }

    /// <summary>Added in v2: nullable, never required.</summary>
    public string? Carrier { get; init; }

    /// <summary>Added in v2: defaulted, so v1 documents still read.</summary>
    public int Priority { get; init; } = 5;

    /// <summary>
    /// Members this version does not understand, kept so a middle tier does
    /// not silently delete somebody else's contract.
    /// </summary>
    [JsonExtensionData]
    public Dictionary<string, JsonElement>? Unknown { get; set; }
}

public static class Versioning
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public static ShipmentDto Read(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);

        // A missing required member is a JsonException from the serializer -
        // no hand-rolled validation needed.
        return JsonSerializer.Deserialize<ShipmentDto>(json, Options)
            ?? throw new JsonException("the payload was null");
    }

    public static string Write(ShipmentDto dto)
    {
        ArgumentNullException.ThrowIfNull(dto);
        return JsonSerializer.Serialize(dto, Options);
    }

    /// <summary>
    /// Looks at the document, not the model: version detection and validation
    /// are different jobs and conflating them answers neither cleanly.
    /// </summary>
    public static string DetectVersion(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);

        using JsonDocument document = JsonDocument.Parse(json);
        return document.RootElement.TryGetProperty("carrier", out _) ? "v2" : "v1";
    }
}
