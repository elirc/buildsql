# Reading - csharp/v3cc05_system_text_json

## Notes

**The wire format is the contract; your class is not.** Renaming a property is
a breaking change to every consumer unless you pin the JSON name. Adding a
non-nullable property breaks old producers. Removing one breaks old consumers.
The discipline that follows: decide the JSON explicitly with attributes or a
converter, and treat a change to it like a change to a public API.

**Options instances cache metadata, so share them.** The serializer builds a
`JsonTypeInfo` per type per options instance, involving reflection and
delegate creation. A new `JsonSerializerOptions` per call throws that away
every time and is one of the most expensive mistakes available in .NET. Since
.NET 8 an instance is frozen on first use — mutating it afterwards throws
`InvalidOperationException` — which is the runtime pushing you towards a single
static instance.

**`JsonSerializerDefaults.Web` is a preset, not magic.** It sets camelCase
naming, case-insensitive property matching, and allows reading numbers from
strings. ASP.NET Core uses it, which is why serialising by hand elsewhere in
the same codebase can produce different JSON from the same type — a
surprisingly common source of "it works in the API but not in the worker".

**`Utf8JsonReader` is a `ref struct` over UTF-8 bytes.** It never allocates a
string unless you ask for one, cannot be stored in a field or captured, and
cannot cross an `await`. That is the design: JSON arrives as bytes, and
decoding to UTF-16 strings before parsing is exactly the waste the type
avoids.

**A converter's `Read` must leave the reader on its value's last token.** The
serializer advances once after your converter returns. Leave the reader one
token short and the next property is misread; advance one too far and you skip
a token, and the exception surfaces somewhere unrelated. `reader.Skip()` moves
over an entire nested value, which is the correct tool when you need to ignore
one.

**Source generation replaces reflection with code.**
`[JsonSerializable(typeof(Order))] partial class AppJsonContext :
JsonSerializerContext` makes the compiler emit the reader, writer and metadata
at build time. The wins are startup time (no reflection or delegate creation
per type), trimming and AOT safety (the metadata is code the trimmer can see),
and throughput. The cost is that everything must be known statically, which is
why polymorphism and generics need explicit declaration.

**Versioning has an asymmetric rule: read tolerantly, write strictly.** Ignore
unknown members rather than failing; supply defaults for members added later;
write exactly the current shape and nothing else. `[JsonExtensionData]` gives
you round-trip preservation of members you do not understand, which is what
stops a middle-tier service from silently deleting a field two systems away.

## ex1

Really testing: that options are a shared, cached contract. The gate measures
allocations because the difference is not subtle — a fresh options instance per
call re-derives every type's metadata, and the allocation figure separates the
two implementations without a stopwatch. The classic mistake is
`JsonSerializer.Serialize(value, new JsonSerializerOptions { ... })` inside a
method, which looks harmless and is the single most expensive line in a lot of
services. The second is expecting `WriteIndented` or naming policy to apply
when the caller forgot to pass the options at all.

## ex2

Really testing: the two halves of a converter and their token discipline.
`Read` starts on the value's first token — here a string — and returns without
advancing past it. A wrong token type must be a `JsonException` so the
serializer can add path information; throwing `FormatException` produces an
error with no idea where in the document it happened. The classic mistake is
parsing with `reader.GetString()` and then not validating, so `"GBP"` with no
amount produces a default `Money` instead of an error.

## ex3

Really testing: that null is handled *before* your converter by default. The
serializer writes `null` and reads `null` for reference types and
`Nullable<T>` without consulting the converter at all, unless the converter
sets `HandleNull` to true. The classic mistake is a converter that throws on
`JsonTokenType.Null` for a property that is legitimately nullable — never
reached in testing, reached immediately in production. Also worth noting:
`DateOnly` and `TimeOnly` gained built-in converters in .NET 7, so a custom one
is now a deliberate choice about the *wire format*, not a workaround.

## ex4

Really testing: how a reader knows which type to construct. The built-in
polymorphic support writes a `$type` discriminator (or your chosen name) and
requires it to be the **first** property when reading, because the reader is
forward-only and must decide before it consumes the body. The classic mistake
is a wire format where the discriminator is in the middle — common when the
other end is not .NET — which the built-in support cannot handle and a custom
converter can, by buffering with `JsonDocument`. The second mistake is using
type names as discriminators, which turns a class rename into a breaking wire
change.

## ex5

Really testing: what the generator buys and what it demands. It emits
`JsonTypeInfo` as code, so there is no reflection at startup, nothing for a
trimmer to remove by accident, and no `MakeGenericType` for AOT to reject. In
exchange every serialisable type must be declared with `[JsonSerializable]`,
and anything dynamic — `object`, open generics, runtime-chosen types — needs
explicit handling. The classic mistake is adding the context but never wiring
it into `TypeInfoResolver`, so the reflection path is silently still in use and
the AOT build fails at the last minute.

## ex6

Really testing: the asymmetry. Reading must tolerate members you have never
heard of, because the producer may be newer than you; writing must emit exactly
today's shape, because consumers parse it. `[JsonExtensionData]` on a
`Dictionary<string, JsonElement>` captures the unknown members and writes them
back out, which makes a service safe to put in the middle of two systems it
does not fully understand. The classic mistake is `required` on a member added
in v2, which rejects every v1 document — `required` belongs only on members that
were in the very first version.

## ex7

Really testing: reading without materialising. A `Utf8JsonReader` loop over an
array can count, filter and extract while allocating nothing but the values you
keep, where `Deserialize<List<T>>` builds the entire payload first. `Skip()` is
the essential move: positioned on `StartObject`, it steps over the whole
object, including nested ones, in one call. The classic mistake is a manual
depth counter that gets the nesting wrong on the first array-inside-object, or
forgetting that `Read()` returns false at the end of the buffer rather than
throwing.

## ex8

Really testing: the jobs a POCO cannot do. Renaming, splitting and reshaping
are transformations of a *document*, and modelling both versions as classes to
do them is more work than editing the tree. `JsonNode` is mutable and is the
right tool; `JsonDocument` is read-only, pooled, and must be disposed — using it
without a `using` leaks pooled buffers. The classic mistake is mutating a
`JsonNode` that is still parented to another node, which throws; detach with
`.Deserialize<JsonNode>()` or build a new node rather than reparenting.

## Further reading

- [How to use System.Text.Json](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview) - the entry point and the options.
- [Custom converters](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/converters-how-to) - Read/Write contracts and HandleNull.
- [Source generation](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/source-generation) - contexts, modes, and trimming.
- [Polymorphic serialization](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/polymorphism) - JsonDerivedType and discriminators.
- [Utf8JsonReader](https://learn.microsoft.com/en-us/dotnet/api/system.text.json.utf8jsonreader) - the forward-only, allocation-free reader.
- [JsonNode](https://learn.microsoft.com/en-us/dotnet/api/system.text.json.nodes.jsonnode) - the mutable DOM for document surgery.
