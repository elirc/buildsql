@@PROMPT@@
## Exercise 1 - options are the contract

Edit `src/Lessons/V3CC05_SystemTextJson/Ex1.cs`.

`Contract.Json` is a single static `JsonSerializerOptions` configured as:
camelCase property names, nulls omitted when writing, enums written as strings,
numbers readable from strings, and case-insensitive reading.

`Order(string Id, Status Status, string? Note, decimal Total)` with
`enum Status { Draft, Placed, Shipped }` round-trips through it:

- `Contract.Write(Order order)` -> the JSON string.
- `Contract.Read(string json)` -> the order.

```
Write(new Order("A1", Status.Placed, null, 12.5m))
  -> {"id":"A1","status":"Placed","total":12.5}          // note is omitted
Read("{\"ID\":\"A1\",\"status\":\"Shipped\",\"total\":\"3\"}")
  -> Order("A1", Status.Shipped, null, 3m)               // case-insensitive, number from string
```

Then prove why the instance is shared:

`Bench.Compare(int iterations)` returns `(long Shared, long PerCall)` — the
bytes allocated round-tripping `iterations` orders through `Contract.Json`
versus through a freshly constructed options object each time. Use
`GC.GetAllocatedBytesForCurrentThread()` as in sector C1.

```
Compare(200)  ->  PerCall is many times Shared
```

The gate asserts `PerCall > Shared * 3`, and separately that mutating
`Contract.Json` after first use throws `InvalidOperationException` — the .NET 8
freeze.

```
uv run dojo test csharp v3cc05_system_text_json ex1
```
@@HINTS@@
## Hint 1

Every setting in the options object is a decision about the *wire format*:
what a property is called, whether a null appears, whether an enum is a number
or a name. Put them in one place and the contract is reviewable; scatter them
across call sites and it is not.

## Hint 2

Start from the web preset rather than from nothing:

```csharp
public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
{
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    Converters = { new JsonStringEnumConverter() },
};
```

`JsonSerializerDefaults.Web` already gives you camelCase, case-insensitive
reads and numbers-from-strings — which is exactly what ASP.NET Core uses, so
your worker and your API will agree.

## Hint 3

For the benchmark, keep the measured region tight: build the order outside the
loop, measure only the serialise-and-deserialise pair, and be sure the
per-call version constructs its options *inside* the loop — that is the thing
being measured. Decide whether to include the `JsonStringEnumConverter`
allocation in the per-call cost; it is part of the mistake, so probably yes.
@@IMPORTANT@@
## Hint 1

Ask what breaks when the contract is implicit. Someone serialises the same type
in a background job without passing your options; the JSON comes out
PascalCase; a consumer that matched on `"id"` sees `"Id"` and reads null. No
exception, no test failure, wrong data downstream. A single shared instance is
the fix and the reason.

## Hint 2

The .NET 8 freeze is worth triggering deliberately once:

```csharp
Contract.Json.WriteIndented = true;   // after first use: InvalidOperationException
```

An options instance becomes read-only the first time it is used to serialise,
because its metadata cache has been built and mutating the settings would make
the cache lie. The exception is the runtime telling you that options are
configuration, not state.

## Hint 3

`JsonIgnoreCondition.WhenWritingNull` and `WhenWritingDefault` differ in a way
that will bite you: the second also omits `0`, `false` and empty structs, which
is usually not what a consumer expects — a missing `total` is not the same as a
total of zero. Choose deliberately and be able to say what the receiving system
would infer from an absent property.
@@REF@@
// v3cc05_system_text_json / ex1 - options are the contract.
// See lessons/v3cc05_system_text_json/README.md, "Exercise 1".

using System.Text.Json;
using System.Text.Json.Serialization;

namespace CSharpDojo.V3CC05_SystemTextJson;

public enum Status
{
    Draft,
    Placed,
    Shipped,
}

public sealed record Order(string Id, Status Status, string? Note, decimal Total);

public static class Contract
{
    /// <summary>
    /// One instance, shared. The serializer caches type metadata per options
    /// object, so a fresh instance per call rebuilds all of it every time.
    /// Web defaults give camelCase, case-insensitive reads and numbers from
    /// strings - the same settings ASP.NET Core uses.
    /// </summary>
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        // WhenWritingNull, not WhenWritingDefault: an absent "total" and a
        // total of zero must not look the same to a consumer.
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() },
    };

    public static string Write(Order order)
    {
        ArgumentNullException.ThrowIfNull(order);
        return JsonSerializer.Serialize(order, Json);
    }

    public static Order Read(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);
        return JsonSerializer.Deserialize<Order>(json, Json)
            ?? throw new JsonException("the payload was null");
    }
}

public static class Bench
{
    public static (long Shared, long PerCall) Compare(int iterations)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(iterations);

        Order order = new("A1", Status.Placed, null, 12.5m);

        long shared = Measure(() =>
        {
            string json = JsonSerializer.Serialize(order, Contract.Json);
            _ = JsonSerializer.Deserialize<Order>(json, Contract.Json);
        }, iterations);

        long perCall = Measure(() =>
        {
            // The mistake, measured: this instance's metadata cache is built
            // and thrown away on every single call.
            JsonSerializerOptions options = new(JsonSerializerDefaults.Web)
            {
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                Converters = { new JsonStringEnumConverter() },
            };

            string json = JsonSerializer.Serialize(order, options);
            _ = JsonSerializer.Deserialize<Order>(json, options);
        }, iterations);

        return (shared, perCall);
    }

    private static long Measure(Action work, int iterations)
    {
        // Warm up outside the measurement so the shared cache is already
        // built for both paths - otherwise the first run pays for the rest.
        work();

        long before = GC.GetAllocatedBytesForCurrentThread();
        for (int i = 0; i < iterations; i++)
        {
            work();
        }

        return GC.GetAllocatedBytesForCurrentThread() - before;
    }
}
