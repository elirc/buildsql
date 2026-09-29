# V3·C5 — System.Text.Json: converters, source generation, versioning a contract

## The framing

Your class is an implementation detail. The JSON is a contract with other
people's software, it outlives your refactors, and changing it is a breaking
change whether or not anything in your solution stops compiling. Everything in
this sector follows from taking that seriously.

## The options object

```csharp
public static class Contract
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        NumberHandling = JsonNumberHandling.AllowReadingFromString,
        Converters = { new JsonStringEnumConverter() },
        TypeInfoResolver = AppJsonContext.Default,
    };
}
```

One instance, static, shared. The serializer caches a `JsonTypeInfo` per type
**per options instance**, so a fresh instance per call re-derives everything —
reflection, delegate creation, the lot. It is measurable at an order of
magnitude. Since .NET 8 the instance freezes on first use and mutating it
afterwards throws, which is the runtime enforcing what the guidance already
said.

`JsonSerializerDefaults.Web` is what ASP.NET Core uses: camelCase,
case-insensitive reads, numbers readable from strings. If your API and your
background worker serialise the same type differently, this is usually why.

## Writing a converter

```csharp
public sealed class MoneyConverter : JsonConverter<Money>
{
    public override Money Read(ref Utf8JsonReader reader, Type _, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.String)
            throw new JsonException($"expected a string, found {reader.TokenType}");

        ReadOnlySpan<char> text = reader.GetString().AsSpan();
        int space = text.IndexOf(' ');
        if (space <= 0 || !decimal.TryParse(text[(space + 1)..], out decimal amount))
            throw new JsonException($"'{text}' is not a money value");

        return new Money(text[..space].ToString(), amount);
    }

    public override void Write(Utf8JsonWriter writer, Money value, JsonSerializerOptions options)
        => writer.WriteStringValue($"{value.Currency} {value.Amount:0.00}");
}
```

Contract rules for `Read`:

- You are positioned on the value's **first** token.
- You must return with the reader on the value's **last** token. For a scalar
  that means not advancing at all; for an object it means positioned on the
  closing brace.
- Wrong shape is a `JsonException`. The serializer catches it and adds the
  JSON path, which is how the caller finds out it was `items[3].price`.
- Do not swallow. A converter that returns a default on bad input turns a
  loud failure into a silent wrong value.

For `Write`: emit exactly one complete value, and validate before writing
anything, because a half-written value cannot be retracted.

## Source generation

```csharp
[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(Order))]
[JsonSerializable(typeof(IReadOnlyList<Order>))]
internal sealed partial class AppJsonContext : JsonSerializerContext;

// then either:
JsonSerializer.Serialize(order, AppJsonContext.Default.Order);
// or via options:
options.TypeInfoResolver = AppJsonContext.Default;
```

What it buys: no reflection at startup, metadata the trimmer can see, no
`MakeGenericType` for Native AOT to reject, and faster serialisation. What it
costs: every type must be declared, and anything genuinely dynamic needs a
plan. The mistake to avoid is adding the context and forgetting to wire it in —
the reflection path keeps working, so nothing fails until the AOT publish.

## Versioning: read tolerantly, write strictly

```csharp
public sealed class OrderDto
{
    public required string Id { get; init; }            // present since v1
    public string? Region { get; init; }                 // added in v2: nullable
    public int Priority { get; init; } = 5;              // added in v2: defaulted

    [JsonExtensionData]
    public Dictionary<string, JsonElement>? Unknown { get; set; }
}
```

- **Unknown members are captured, not rejected**, and written back out. A
  middle-tier service that drops fields it does not understand corrupts data
  for systems it has never heard of.
- **`required` only for members that existed in v1.** Putting it on a v2
  addition rejects every older document.
- **New members are nullable or defaulted.** Never non-nullable without a
  default.
- **Never rename without `[JsonPropertyName]`** pinning the old wire name.

## Common mistakes

- `new JsonSerializerOptions()` inside a method. The cache-destroying line.
- Forgetting to pass options at a call site, so one path serialises PascalCase
  and another camelCase.
- A converter that leaves the reader in the wrong position — an error three
  properties later, about the wrong property.
- Throwing anything but `JsonException` from a converter, losing the path.
- `JsonDocument` without `using`. It rents pooled buffers.
- Class names as polymorphic discriminators, making a rename a wire break.
- `[JsonIgnore]` used to hide a property that consumers actually rely on.
- Assuming property order is stable or meaningful. It is neither, except for
  the polymorphic discriminator, which must come first.
- Deserialising untrusted JSON into a type with a settable `object` property
  and no depth limit. `MaxDepth` defaults to 64 for a reason.

## Interview answer

*"How would you customise how a type is serialised?"* — In order of
preference: attributes (`[JsonPropertyName]`, `[JsonIgnore]`,
`[JsonConverter]`) for per-property tweaks; a `JsonSerializerOptions` instance
shared as the contract for policy — naming, nulls, enums; and a
`JsonConverter<T>` when the wire representation genuinely differs from the CLR
shape, such as money as a formatted string. For hot paths or AOT, add a
source-generated `JsonSerializerContext` so there is no reflection at run time.

*"How do you version a JSON contract?"* — Read tolerantly and write strictly.
New members are nullable or defaulted; `required` is reserved for members that
existed from the start; unknown members are captured with
`[JsonExtensionData]` and round-tripped so intermediaries do not destroy data;
and property names are pinned so a class rename is not a wire break.

## Check yourself

1. Why is `new JsonSerializerOptions()` per call expensive, and what changed
   in .NET 8 to push back on it?
2. What does `JsonSerializerDefaults.Web` actually set?
3. Where must a converter's `Read` leave the reader, and what breaks otherwise?
4. Why must a converter throw `JsonException` rather than `FormatException`?
5. When is your converter asked about `null`, and how do you change that?
6. Why must the polymorphic discriminator be the first property?
7. Name two things a source-generated context gives you that reflection cannot.
8. What breaks if you put `required` on a property added in v2?
9. What does `[JsonExtensionData]` protect against, in a middle-tier service?
10. What does `reader.Skip()` do when positioned on `StartObject`?
11. Why must `JsonDocument` be disposed but `JsonNode` need not be?
12. How do you serialise `Money` as `"GBP 12.34"` without changing the CLR
    type?
13. What is the default `MaxDepth` and why does it exist?
14. Your API returns camelCase and your worker returns PascalCase for the same
    type. What is the most likely cause?
