# V3·C5 — System.Text.Json: converters, source generation, versioning a contract

Serialisation looks like a solved problem right up to the moment it is not.
`JsonSerializer.Serialize(order)` works on your first day; then a partner
system needs money as `"GBP 12.34"`, an old client is still sending `name` as
one string where you now have two fields, a trimmed AOT build starts throwing
about missing metadata, and somebody adds a property that silently breaks a
consumer you did not know existed.

The framing that makes all of that tractable: **the JSON is a contract, and
your class is an implementation detail.** The wire format has other people's
code depending on it, it outlives your refactors, and it deserves the same care
as a public API. This sector is about controlling it deliberately.

## Options are the contract, and they are cached

```csharp
private static readonly JsonSerializerOptions Contract = new(JsonSerializerDefaults.Web)
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    Converters = { new JsonStringEnumConverter() },
};
```

Two things matter here and both are frequently got wrong. First, this object
*is* the contract — naming, null handling, enum representation — so it belongs in
one place, not scattered across call sites. Second, the serializer caches
reflection metadata **per options instance**, and constructing a fresh
`JsonSerializerOptions` inside a method throws that cache away every call. It
is one of the most common .NET performance bugs, and it can cost an order of
magnitude. Since .NET 8, an options instance is frozen on first use, so
mutating it afterwards throws — which is the runtime telling you the same
thing.

## A converter is a reader and a writer

```csharp
public sealed class MoneyConverter : JsonConverter<Money>
{
    public override Money Read(ref Utf8JsonReader reader, Type type, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.String) throw new JsonException("expected a string");
        ...
    }

    public override void Write(Utf8JsonWriter writer, Money value, JsonSerializerOptions options)
        => writer.WriteStringValue($"{value.Currency} {value.Amount:0.00}");
}
```

The rules that matter: `Read` is handed a reader positioned on the value's
first token and must leave it on the value's **last** token — not past it — and
a wrong token type is a `JsonException`, not an `InvalidOperationException`.
`Write` must emit exactly one complete value. Get either wrong and the failure
appears three properties later, in a message about something unrelated.

## Exercise 1 - options are the contract

Edit `src/Lessons/V3CC05_SystemTextJson/Ex1.cs`. Build a single cached options
instance with camelCase naming, nulls omitted, enums as strings, and prove the
cost: `Bench.Compare` round-trips with a shared instance and with a fresh one
per call, and reports the allocation difference.

```
uv run dojo test csharp v3cc05_system_text_json ex1
```

## Exercise 2 - a converter for a value type

Edit `src/Lessons/V3CC05_SystemTextJson/Ex2.cs`. `Money` on the wire is
`"GBP 12.34"`. Write both halves against `Utf8JsonReader` and `Utf8JsonWriter`,
rejecting a wrong token type and a malformed string with `JsonException`.

```
uv run dojo test csharp v3cc05_system_text_json ex2
```

## Exercise 3 - nulls, and who handles them

Edit `src/Lessons/V3CC05_SystemTextJson/Ex3.cs`. A `DateOnly` written as Unix
seconds, plus a converter that opts into seeing `null` with `HandleNull` — and
the demonstration that by default your converter is never asked about null at
all.

```
uv run dojo test csharp v3cc05_system_text_json ex3
```

## Exercise 4 - polymorphism and the discriminator

Edit `src/Lessons/V3CC05_SystemTextJson/Ex4.cs`. `[JsonPolymorphic]` and
`[JsonDerivedType]` with stable string discriminators, the rule that the
built-in reader needs the discriminator **first**, and a custom converter for
the wire format that puts `type` in the middle.

```
uv run dojo test csharp v3cc05_system_text_json ex4
```

## Exercise 5 - source generation

Edit `src/Lessons/V3CC05_SystemTextJson/Ex5.cs`. A
`partial class AppJsonContext : JsonSerializerContext` with `[JsonSerializable]`
attributes, wired through `TypeInfoResolver`, plus the reasoning: no startup
reflection, no `MakeGenericType`, and metadata a trimmer can see.

```
uv run dojo test csharp v3cc05_system_text_json ex5
```

## Exercise 6 - versioning a contract

Edit `src/Lessons/V3CC05_SystemTextJson/Ex6.cs`. Tolerant reading, strict
writing: unknown members captured with `[JsonExtensionData]` and preserved on
round trip, `required` members that must be present, and defaults for fields
that only exist in v2.

```
uv run dojo test csharp v3cc05_system_text_json ex6
```

## Exercise 7 - streaming without materialising

Edit `src/Lessons/V3CC05_SystemTextJson/Ex7.cs`. Count and filter the elements
of a large array with a hand-written `Utf8JsonReader` loop, using `Skip()` to
step over nested objects you do not care about — and never building a `List<T>`
of the whole payload.

```
uv run dojo test csharp v3cc05_system_text_json ex7
```

## Exercise 8 - migrating a document

Edit `src/Lessons/V3CC05_SystemTextJson/Ex8.cs`. `JsonNode` for the jobs a POCO
cannot do: rename a field, split `"Ada Lovelace"` into two, wrap a scalar in an
array, and drop a field that no longer exists — a v1 document in, a v2 document
out, with no model in the middle.

```
uv run dojo test csharp v3cc05_system_text_json ex8
```

## Challenge

`ContractV2` reads both v1 and v2 payloads through one converter, preserves
unknown members across a round trip, is registered in a source-generated
context, and writes only v2. That is a real migration, in one type, and the
gate feeds it documents from both eras.

## Review

`review1` is the converter correctness gauntlet from the other direction: a
`Read` that must consume exactly its own tokens — no more, no fewer, including
nested objects it skips — and a `Write` that never emits half a value when
validation fails. Both failures are invisible in a small test and catastrophic
in a large document.
