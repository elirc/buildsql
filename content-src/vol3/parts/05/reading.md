# Long reading - UTF-8 first, and why that changed everything

## The problem with the old serializer

`Newtonsoft.Json` — for a decade the de facto standard, and still an excellent
library — was designed around `TextReader` and `TextWriter`. JSON arrives from
a socket as UTF-8 bytes; to parse it, Json.NET decoded those bytes into UTF-16
`string`s, allocated a token stream, and populated objects by reflection.
Every stage allocated. For a web framework serialising thousands of responses a
second, the transcoding alone was a measurable fraction of CPU.

`System.Text.Json` was built for the opposite priority. It works directly on
UTF-8 bytes, never transcoding unless you ask for a `string`; its reader is a
`ref struct` so it lives on the stack and allocates nothing; and it is
deliberately strict where Json.NET was permissive, because permissiveness costs
branches and hides bugs.

That strictness is the main migration pain. Json.NET accepts single quotes,
trailing commas, comments, unquoted names and case-insensitive property
matching by default. `System.Text.Json` accepts none of that unless you opt in
(`AllowTrailingCommas`, `ReadCommentHandling`, `PropertyNameCaseInsensitive`).
It also will not deserialise into fields by default, will not call
non-public constructors, and treats `TimeSpan` and `DateTimeOffset` formats
differently. None of this is a bug; all of it surprises somebody.

## `Utf8JsonReader`, and why it is a `ref struct`

```csharp
var reader = new Utf8JsonReader(bytes, isFinalBlock: true, state: default);
while (reader.Read())
{
    switch (reader.TokenType)
    {
        case JsonTokenType.PropertyName when reader.ValueTextEquals("id"u8):
            reader.Read();
            id = reader.GetInt32();
            break;
        case JsonTokenType.StartObject:
            reader.Skip();          // step over the whole nested object
            break;
    }
}
```

Three design decisions are visible in that snippet.

**It is forward-only.** There is no going back, no peeking beyond the next
token, and no random access. That is what allows it to work over a stream in
fixed-size buffers with no intermediate document.

**It is a `ref struct`.** It cannot be boxed, stored in a field, captured by a
lambda, or held across an `await`. Those restrictions are what make it safe to
point directly at a stack buffer or a rented array, and they are why
asynchronous JSON reading is structured as "fill a buffer, parse it
synchronously, repeat" rather than "await inside the parse loop".

**Comparisons avoid strings.** `ValueTextEquals("id"u8)` compares the raw UTF-8
bytes; `reader.GetString()` would allocate. The `u8` suffix produces a UTF-8
literal at compile time, so there is no conversion at all. On a hot parse path
this is the difference between allocating per property and allocating nothing.

## The metadata cache, and the cost of getting it wrong

For each type, the serializer builds a `JsonTypeInfo`: the property list, the
naming policy applied, the converters selected, and delegates that get and set
each member. Building it involves reflection and `DynamicMethod` or expression
compilation. It is cached — **keyed on the options instance**.

So this:

```csharp
public string ToJson(Order order) =>
    JsonSerializer.Serialize(order, new JsonSerializerOptions { WriteIndented = true });
```

rebuilds all of it on every call. The measured penalty in real services is
routinely 10x to 100x on serialisation cost, plus a large allocation spike, and
it is invisible in code review because the line looks tidy. .NET 8's
freeze-on-first-use behaviour was added partly to make the intended usage
obvious: an options instance is configuration, built once.

## Source generation, and what it actually emits

The generator produces, at compile time, a partial class containing a
`JsonTypeInfo` per declared type, with the property metadata as code and the
getters and setters as direct member accesses rather than reflection
delegates. There are two modes.

**Metadata mode** emits the type information but still uses the general
serialisation machinery. It removes the startup reflection and is compatible
with everything.

**Serialization mode** additionally emits a fast-path `Write` that writes
properties directly to the writer with no metadata walk at all. It is the
fastest option and only applies when the type and options are simple enough —
no reference handling, no custom converter on the type, and so on. When the
conditions are not met, it silently falls back to the metadata path, which is
why measured gains vary.

The trimming and AOT story is the more important one. A trimmer removes code
nothing references; reflection-based serialisation references your properties
only through metadata the trimmer cannot see, so trimming a reflection-based
app produces runtime failures about missing members. Generated code references
them directly, so the trimmer keeps them. Native AOT goes further and forbids
the dynamic code generation the reflection path uses at all — so for AOT, source
generation is not an optimisation, it is the only option.

## Polymorphism, and the discriminator-first rule

.NET 7 added first-class polymorphic serialisation:

```csharp
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(CardPayment), "card")]
[JsonDerivedType(typeof(BankPayment), "bank")]
public abstract class Payment;
```

The discriminator must be the **first** property in the JSON object when
reading, because the reader is forward-only: it has to know which type to
construct before it starts assigning members, and buffering the object to look
ahead would defeat the streaming design.

That constraint is fine when .NET is on both ends and a problem when it is not.
A partner system that emits `{"amount": 10, "kind": "card"}` cannot be read by
the built-in support. The workaround is a converter that parses the object into
a `JsonDocument` — buffering deliberately, at a cost you have chosen — reads the
discriminator wherever it is, and then deserialises the buffered element into
the resolved type.

Also worth deciding early: discriminator values should be stable strings you
choose, never type names. Using `nameof(CardPayment)` or the default type name
makes a class rename a breaking wire change, and someone will rename the class.

## Security and limits

Deserialisation of untrusted input has a history. `System.Text.Json` avoids the
worst of it by not supporting type resolution from the payload — there is no
`$type`-to-arbitrary-CLR-type mechanism the way `TypeNameHandling.All` was in
Json.NET, which was the source of remote code execution vulnerabilities. The
polymorphic support requires types to be declared in advance, which is exactly
the right default.

The limits that remain are resource ones. `MaxDepth` defaults to 64 to stop a
deeply nested payload exhausting the stack. Very large numbers, very long
strings and enormous arrays all cost memory proportional to the input, so a
size limit belongs at the transport layer. And `[JsonExtensionData]` on an
untrusted payload will happily accumulate whatever the caller sends, which is a
memory amplification vector if you then store it.

## When not to reach for a converter

Custom converters are the heavy tool and are frequently used where an attribute
would do. Before writing one, check whether `[JsonPropertyName]`,
`[JsonIgnore]`, `[JsonNumberHandling]`, `[JsonConstructor]` or a naming policy
solves it. A converter takes over the entire representation of a type — every
option that applied to it stops applying unless you re-implement it, including
naming policy and null handling for its members. That is a lot of behaviour to
own for the sake of one property's format.

The cases that genuinely warrant one: a value type whose wire form is a scalar
(`Money` as a string, a strongly-typed id as a bare number), a legacy format
you do not control, a polymorphic shape the built-in support cannot express,
and performance-critical types where the fast path is worth hand-writing.
Everything else is better served by attributes and a shared options instance.
