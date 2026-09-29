@@PROMPT@@
## Exercise 5 - source generation

Edit `src/Lessons/V3CC05_SystemTextJson/Ex5.cs`.

Move the serialisation metadata from run-time reflection to compile-time code.

```csharp
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
[JsonSerializable(typeof(Catalogue))]
[JsonSerializable(typeof(IReadOnlyList<Product>))]
internal sealed partial class AppJsonContext : JsonSerializerContext;
```

`Product(string Sku, string Name, decimal Price, string? Notes)` and
`Catalogue(string Region, IReadOnlyList<Product> Products)`.

Implement:

- `Generated.Write(Catalogue catalogue)` — serialises through
  `AppJsonContext.Default.Catalogue`, with no options object at the call site.
- `Generated.Read(string json)` — deserialises through the same.
- `Generated.Options` — a `JsonSerializerOptions` whose `TypeInfoResolver` is
  `AppJsonContext.Default`, for the code paths that need an options object.
- `Generated.ResolvesWithoutReflection(Type type)` — whether
  `AppJsonContext.Default.GetTypeInfo(type)` returns non-null, which is how you
  check a type is actually covered by the context rather than silently falling
  back.

```
Write(new Catalogue("uk", [new Product("A1", "Bolt", 1.5m, null)]))
  -> {"region":"uk","products":[{"sku":"A1","name":"Bolt","price":1.5}]}

ResolvesWithoutReflection(typeof(Catalogue))   -> true
ResolvesWithoutReflection(typeof(DateOnly))    -> false   // never declared
```

The gate round-trips through the context and asserts the declared types resolve
and an undeclared one does not — the check that catches "added the context,
forgot to wire it in".

```
uv run dojo test csharp v3cc05_system_text_json ex5
```
@@HINTS@@
## Hint 1

The generator turns your `[JsonSerializable]` declarations into a partial class
full of `JsonTypeInfo` objects built from code rather than from reflection.
Everything else follows: no startup cost per type, metadata a trimmer can see,
and no dynamic code for Native AOT to reject.

## Hint 2

There are two ways to use it, and they are not equivalent:

```csharp
JsonSerializer.Serialize(catalogue, AppJsonContext.Default.Catalogue);   // direct
options.TypeInfoResolver = AppJsonContext.Default;                        // via options
```

The first is unambiguous and fails to compile if the type is not declared. The
second keeps existing call sites working, and is the one people forget — the
reflection path keeps functioning, so nothing breaks until an AOT publish.

## Hint 3

`GetTypeInfo` returning null is your proof of coverage. Use it to check every
type your API actually serialises, including the collection types — a context
that declares `Product` but not `IReadOnlyList<Product>` resolves the element
and not the list, which is the failure mode that shows up as an AOT warning
rather than a test failure. Decide which types belong in the context and be
able to justify each.
@@IMPORTANT@@
## Hint 1

Ask what the reflection path actually does at startup: for each type, walk its
properties, apply the naming policy, select converters, and build get/set
delegates with `DynamicMethod`. On a service with a hundred DTOs that is real
milliseconds and real allocation on the first request. The generator moves all
of it to compile time.

## Hint 2

`[JsonSourceGenerationOptions]` on the context sets the policy for everything
it generates, and it is the compile-time twin of the options object:

```csharp
[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
```

Note that it takes `JsonKnownNamingPolicy` — an enum — rather than a policy
instance, because it must be resolvable at compile time. That constraint is a
good summary of the whole feature: anything the generator cannot see
statically, it cannot generate.

## Hint 3

Think about what the generator cannot do, because it defines when you still
need the reflection path: `object`-typed members, open generics resolved at run
time, types chosen by a string, and anything reached only through
`Activator.CreateInstance`. If your design needs those, the honest answer is
either to restructure it or to accept that this part is not AOT-compatible —
and saying which, out loud, is better than finding out at publish time.
@@REF@@
// v3cc05_system_text_json / ex5 - source generation.
// See lessons/v3cc05_system_text_json/README.md, "Exercise 5".

using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace CSharpDojo.V3CC05_SystemTextJson;

public sealed record Product(string Sku, string Name, decimal Price, string? Notes);

public sealed record Catalogue(string Region, IReadOnlyList<Product> Products);

/// <summary>
/// The compile-time twin of a JsonSerializerOptions: the generator emits a
/// JsonTypeInfo per declared type, so nothing is discovered by reflection at
/// startup and the trimmer can see every member that is used.
/// </summary>
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
[JsonSerializable(typeof(Catalogue))]
[JsonSerializable(typeof(IReadOnlyList<Product>))]
[JsonSerializable(typeof(Product))]
internal sealed partial class AppJsonContext : JsonSerializerContext;

public static class Generated
{
    /// <summary>
    /// For call sites that need an options object. Forgetting this line is the
    /// classic mistake: the reflection path keeps working, so nothing fails
    /// until an AOT publish.
    /// </summary>
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        TypeInfoResolver = AppJsonContext.Default,
    };

    /// <summary>
    /// The unambiguous form: passing the generated JsonTypeInfo directly means
    /// a type that is not declared does not compile.
    /// </summary>
    public static string Write(Catalogue catalogue)
    {
        ArgumentNullException.ThrowIfNull(catalogue);
        return JsonSerializer.Serialize(catalogue, AppJsonContext.Default.Catalogue);
    }

    public static Catalogue Read(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);
        return JsonSerializer.Deserialize(json, AppJsonContext.Default.Catalogue)
            ?? throw new JsonException("the payload was null");
    }

    /// <summary>
    /// Proof of coverage. A context that declares Product but not
    /// IReadOnlyList&lt;Product&gt; resolves the element and not the list, which
    /// surfaces as an AOT warning rather than a test failure.
    /// </summary>
    public static bool ResolvesWithoutReflection(Type type)
    {
        ArgumentNullException.ThrowIfNull(type);

        JsonTypeInfo? info = ((IJsonTypeInfoResolver)AppJsonContext.Default)
            .GetTypeInfo(type, Options);

        return info is not null;
    }
}
