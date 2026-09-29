@@PROMPT@@
## Challenge - one type, two eras

Edit `src/Lessons/V3CC05_SystemTextJson/Challenge.cs`.

A single model that reads both eras of a contract and writes only the current
one — the shape every long-lived integration eventually needs.

The v1 wire format:

```json
{ "ref": "S1", "who": "Ada Lovelace", "amount": "GBP 10.00", "depot": "D9" }
```

The v2 wire format:

```json
{ "schema": 2, "id": "S1", "firstName": "Ada", "lastName": "Lovelace",
  "total": { "currency": "GBP", "amount": 10.00 }, "depot": "D9" }
```

`ShipmentConverter : JsonConverter<Shipment>` reads either and writes v2:

- Buffer with `JsonDocument.ParseValue(ref reader)` and branch on `schema` —
  absent means v1.
- v1: `ref` -> `Id`, `who` split on the last space, `amount` parsed with the
  `MoneyConverter` format from ex2.
- v2: read the members directly; `total` is an object.
- Members neither version declares are captured into
  `Shipment.Unknown` and written back out, so a v1 document with extra fields
  survives a round trip through the v2 writer.
- A missing `id`/`ref` is a `JsonException`.
- `Write` always emits v2, with `"schema": 2` first.

`Shipment(string Id, string FirstName, string? LastName, Money Total,
Dictionary<string, JsonElement>? Unknown)`.

Register the converter in a source-generated context's options
(`ShipmentContext`), so the whole thing works with the resolver from ex5.

```
Read(v1Json).Id           -> "S1"
Read(v1Json).Total        -> Money("GBP", 10.00m)
Read(v1Json).Unknown      -> contains "depot"
Write(Read(v1Json))       -> v2 JSON containing "schema":2 and "depot":"D9"
Read(Write(Read(v1Json))) -> equal to Read(v1Json)      // round trip is stable
```

Honest difficulty note: the reading is straightforward; **what counts as
unknown** is not. `depot` is unknown to both versions and must survive; `who`
is known to v1 and must not appear in the v2 output. Decide the rule before
writing the loop.

```
uv run dojo test csharp v3cc05_system_text_json challenge
```
@@HINTS@@
## Hint 1

Two readers and one writer. Write `ReadV1(JsonElement)` and
`ReadV2(JsonElement)` as separate methods returning the same model, and let
`Read` do nothing but buffer, detect the version, and dispatch. Interleaving
them produces a method full of "if v1 then this key else that key", which is
where the bugs live.

## Hint 2

The unknown-member rule is a set subtraction, and naming the sets makes it
obvious:

```csharp
private static readonly HashSet<string> V1Known = ["ref", "who", "amount"];
private static readonly HashSet<string> V2Known = ["schema", "id", "firstName", "lastName", "total"];
```

Everything in the document that is not in the known set for *that version* is
unknown, gets captured, and gets written back. `who` is in `V1Known`, so it is
consumed rather than carried.

## Hint 3

For the round-trip test to pass, the unknown members must come back identical.
`JsonElement` values are views over the buffered `JsonDocument`, which you are
about to dispose — so they must be cloned with `element.Clone()` before the
`using` ends, or you get an `ObjectDisposedException` at write time. That
single line is the difference between a converter that works in a test and one
that works in a pipeline.
@@IMPORTANT@@
## Hint 1

Start from the round trip, because it is the strongest specification you have:
`Read(Write(Read(x)))` must equal `Read(x)` for a v1 document *and* a v2 one.
Anything the writer drops, the second read cannot recover, so the test fails —
which is exactly the property you want a migration to be held to.

## Hint 2

Writing v2 with the discriminator first is a matter of call order, since
`Utf8JsonWriter` emits in the order you write:

```csharp
writer.WriteStartObject();
writer.WriteNumber("schema", 2);
writer.WriteString("id", value.Id);
...
```

Putting the version first is a courtesy to every forward-only reader on the
other end, including the one you wrote in ex7.

## Hint 3

Think about what `"amount": "GBP 10.00"` becoming `"total": { ... }` means for
consumers. A type change on the wire is the one migration that cannot be done
in place, which is why v2 uses a *new property name* rather than changing the
type of `amount`. Note that decision in a comment — it is the single most
useful versioning rule in this sector, and it is invisible in the code unless
you say it.
@@REF@@
// v3cc05_system_text_json / challenge - one type, two eras.
// See lessons/v3cc05_system_text_json/README.md, "Challenge".

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CSharpDojo.V3CC05_SystemTextJson;

public sealed record Shipment(
    string Id,
    string FirstName,
    string? LastName,
    Money Total,
    Dictionary<string, JsonElement>? Unknown);

/// <summary>
/// Reads v1 and v2, writes v2. Note the versioning rule that shaped this: a
/// property whose TYPE changes gets a new name ("amount" string became "total"
/// object), because a type change in place breaks every consumer at once.
/// </summary>
public sealed class ShipmentConverter : JsonConverter<Shipment>
{
    private static readonly HashSet<string> V1Known = ["ref", "who", "amount"];

    private static readonly HashSet<string> V2Known = ["schema", "id", "firstName", "lastName", "total"];

    public override Shipment Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using JsonDocument document = JsonDocument.ParseValue(ref reader);
        JsonElement root = document.RootElement;

        if (root.ValueKind != JsonValueKind.Object)
        {
            throw new JsonException($"expected an object, found {root.ValueKind}");
        }

        bool isV2 = root.TryGetProperty("schema", out JsonElement schema)
            && schema.ValueKind == JsonValueKind.Number
            && schema.GetInt32() >= 2;

        return isV2 ? ReadV2(root) : ReadV1(root);
    }

    public override void Write(Utf8JsonWriter writer, Shipment value, JsonSerializerOptions options)
    {
        ArgumentNullException.ThrowIfNull(writer);
        ArgumentNullException.ThrowIfNull(value);

        writer.WriteStartObject();

        // Version first: a courtesy to every forward-only reader downstream.
        writer.WriteNumber("schema", 2);
        writer.WriteString("id", value.Id);
        writer.WriteString("firstName", value.FirstName);

        if (value.LastName is null)
        {
            writer.WriteNull("lastName");
        }
        else
        {
            writer.WriteString("lastName", value.LastName);
        }

        writer.WriteStartObject("total");
        writer.WriteString("currency", value.Total.Currency);
        writer.WriteNumber("amount", value.Total.Amount);
        writer.WriteEndObject();

        if (value.Unknown is not null)
        {
            foreach ((string name, JsonElement element) in value.Unknown)
            {
                writer.WritePropertyName(name);
                element.WriteTo(writer);
            }
        }

        writer.WriteEndObject();
    }

    private static Shipment ReadV1(JsonElement root)
    {
        string id = RequireString(root, "ref");

        string who = root.TryGetProperty("who", out JsonElement whoElement)
            ? whoElement.GetString() ?? string.Empty
            : string.Empty;

        int space = who.LastIndexOf(' ');
        string first = space < 0 ? who : who[..space];
        string? last = space < 0 ? null : who[(space + 1)..];

        Money total = root.TryGetProperty("amount", out JsonElement amount)
            ? ParseMoneyString(amount.GetString())
            : throw new JsonException("v1 document has no 'amount'");

        return new Shipment(id, first, last, total, CaptureUnknown(root, V1Known));
    }

    private static Shipment ReadV2(JsonElement root)
    {
        string id = RequireString(root, "id");
        string first = RequireString(root, "firstName");
        string? last = root.TryGetProperty("lastName", out JsonElement lastElement)
            && lastElement.ValueKind == JsonValueKind.String
                ? lastElement.GetString()
                : null;

        if (!root.TryGetProperty("total", out JsonElement total) || total.ValueKind != JsonValueKind.Object)
        {
            throw new JsonException("v2 document has no 'total' object");
        }

        Money money = new(
            total.GetProperty("currency").GetString() ?? throw new JsonException("no currency"),
            total.GetProperty("amount").GetDecimal());

        return new Shipment(id, first, last, money, CaptureUnknown(root, V2Known));
    }

    /// <summary>
    /// Everything the current version does not declare. Cloned, because the
    /// buffering JsonDocument is disposed the moment Read returns and an
    /// un-cloned JsonElement is a view over its pooled memory.
    /// </summary>
    private static Dictionary<string, JsonElement>? CaptureUnknown(JsonElement root, HashSet<string> known)
    {
        Dictionary<string, JsonElement>? unknown = null;
        foreach (JsonProperty property in root.EnumerateObject())
        {
            if (known.Contains(property.Name))
            {
                continue;
            }

            (unknown ??= new Dictionary<string, JsonElement>(StringComparer.Ordinal))
                [property.Name] = property.Value.Clone();
        }

        return unknown;
    }

    private static string RequireString(JsonElement root, string name) =>
        root.TryGetProperty(name, out JsonElement element) && element.ValueKind == JsonValueKind.String
            ? element.GetString()!
            : throw new JsonException($"'{name}' is required");

    private static Money ParseMoneyString(string? text)
    {
        int space = text?.IndexOf(' ') ?? -1;
        if (text is null || space <= 0 ||
            !decimal.TryParse(
                text.AsSpan(space + 1),
                NumberStyles.Number,
                CultureInfo.InvariantCulture,
                out decimal amount))
        {
            throw new JsonException($"'{text}' is not a money value");
        }

        return new Money(text[..space], amount);
    }
}

[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(Shipment))]
internal sealed partial class ShipmentContext : JsonSerializerContext;

public static class Shipments
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        TypeInfoResolver = ShipmentContext.Default,
        Converters = { new ShipmentConverter() },
    };

    public static Shipment Read(string json) =>
        JsonSerializer.Deserialize<Shipment>(json, Options)
            ?? throw new JsonException("the payload was null");

    public static string Write(Shipment shipment) => JsonSerializer.Serialize(shipment, Options);
}
