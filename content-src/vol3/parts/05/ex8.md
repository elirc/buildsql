@@PROMPT@@
## Exercise 8 - migrating a document

Edit `src/Lessons/V3CC05_SystemTextJson/Ex8.cs`.

Four transformations that no POCO can express, done on the document itself with
`JsonNode`.

`Migrator.V1ToV2(string json)` takes a v1 customer document and returns v2:

1. Rename `"customerRef"` to `"id"`, keeping its position irrelevant but its
   value intact.
2. Split `"fullName": "Ada Lovelace"` into `"firstName"` and `"lastName"`, on
   the **last** space; a name with no space becomes `firstName` only, with
   `lastName` null.
3. Wrap the scalar `"email"` in an array `"emails"`, or produce an empty array
   when there was no email.
4. Drop `"legacyFlags"` entirely.
5. Add `"schema": 2`.

Everything else — properties this migration has never heard of — is carried
through unchanged.

`Migrator.SchemaOf(string json)` returns the `"schema"` number, or `1` when
absent.

```
V1ToV2("""{"customerRef":"C7","fullName":"Ada Lovelace","email":"a@x.com","legacyFlags":3,"tier":"gold"}""")
  -> {"tier":"gold","id":"C7","firstName":"Ada","lastName":"Lovelace","emails":["a@x.com"],"schema":2}

V1ToV2("""{"customerRef":"C8","fullName":"Prince"}""")
  -> firstName "Prince", lastName null, emails []

SchemaOf("""{"schema":2}""")  -> 2
SchemaOf("""{"id":"C7"}""")   -> 1
```

Property order in the output is not asserted; presence, absence and values are.

```
uv run dojo test csharp v3cc05_system_text_json ex8
```
@@HINTS@@
## Hint 1

None of these five changes is expressible as an attribute, because they are not
about how a *type* maps to JSON — they are edits to a document. That is what
`JsonNode` is for: a mutable tree you can add to, remove from and reshape,
with no model on either side.

## Hint 2

The API is dictionary-like on objects and list-like on arrays:

```csharp
JsonObject root = JsonNode.Parse(json)!.AsObject();
JsonNode? name = root["fullName"];
root.Remove("fullName");
root["firstName"] = "Ada";
root["emails"] = new JsonArray("a@x.com");
```

Note `JsonNode.Parse` returns a `JsonNode?` and `AsObject()` throws if the
document is an array or a scalar — worth a check with a clear message rather
than an `InvalidOperationException` from inside the library.

## Hint 3

The trap is reparenting: a `JsonNode` belongs to exactly one parent, and
assigning one that is still attached elsewhere throws. So remove it first, or
copy the *value* rather than the node:

```csharp
string? value = root["customerRef"]?.GetValue<string>();
root.Remove("customerRef");
root["id"] = value;
```

Decide whether your migration should move nodes or copy values, and note that
copying values is safer and loses nothing for scalars.
@@IMPORTANT@@
## Hint 1

Ask what happens to the properties you did not think about. A migration that
builds a fresh output object and copies the five fields it knows deletes
everything else — including fields another team added last week. Mutating the
parsed document in place is what makes "carry the rest through" the default
rather than an extra feature.

## Hint 2

`JsonDocument` and `JsonNode` are different tools and the difference matters:

```csharp
using JsonDocument doc = JsonDocument.Parse(json);   // read-only, pooled, disposable
JsonNode? node = JsonNode.Parse(json);                // mutable, not pooled, no using
```

`JsonDocument` is for reading — cheaper, and it must be disposed because it
rents pooled buffers. `JsonNode` is for editing. Using the wrong one gives you
either a leak or an immutable tree you cannot change.

## Hint 3

The last-space rule for splitting names is deliberately crude, and you should
say so in a comment: `"Ada Lovelace"` works, `"Jean de la Fontaine"` becomes
`"Jean de la"` and `"Fontaine"`, and plenty of real names have no such
structure at all. A migration that silently mangles names is worse than one
that flags them — decide whether yours should record the originals somewhere,
and be able to defend the choice.
@@REF@@
// v3cc05_system_text_json / ex8 - migrating a document.
// See lessons/v3cc05_system_text_json/README.md, "Exercise 8".

using System.Text.Json;
using System.Text.Json.Nodes;

namespace CSharpDojo.V3CC05_SystemTextJson;

/// <summary>
/// Document surgery: renames, splits and reshapes that no attribute can
/// express. Mutating the parsed tree in place is what carries unknown
/// properties through instead of deleting them.
/// </summary>
public static class Migrator
{
    public static string V1ToV2(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);

        JsonNode parsed = JsonNode.Parse(json)
            ?? throw new JsonException("the document was null");

        if (parsed is not JsonObject root)
        {
            throw new JsonException($"expected an object, found {parsed.GetValueKind()}");
        }

        // 1. Rename. Copy the value rather than moving the node: a JsonNode
        // has exactly one parent, and reparenting an attached node throws.
        string? reference = root["customerRef"]?.GetValue<string>();
        root.Remove("customerRef");
        root["id"] = reference;

        // 2. Split on the LAST space. Crude on purpose - "Jean de la Fontaine"
        // becomes "Jean de la" and "Fontaine" - and worth flagging rather than
        // pretending it is correct for every name.
        string? fullName = root["fullName"]?.GetValue<string>();
        root.Remove("fullName");
        if (fullName is not null)
        {
            int space = fullName.LastIndexOf(' ');
            root["firstName"] = space < 0 ? fullName : fullName[..space];
            root["lastName"] = space < 0 ? null : fullName[(space + 1)..];
        }

        // 3. Scalar to array.
        string? email = root["email"]?.GetValue<string>();
        root.Remove("email");
        root["emails"] = email is null ? new JsonArray() : new JsonArray(email);

        // 4. Gone.
        root.Remove("legacyFlags");

        // 5. Stamp the version so the next migration knows where it starts.
        root["schema"] = 2;

        return root.ToJsonString();
    }

    public static int SchemaOf(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);

        // JsonDocument, not JsonNode: this only reads, and it is cheaper -
        // at the cost of having to be disposed, because it rents pooled
        // buffers.
        using JsonDocument document = JsonDocument.Parse(json);
        return document.RootElement.TryGetProperty("schema", out JsonElement schema)
            && schema.ValueKind == JsonValueKind.Number
                ? schema.GetInt32()
                : 1;
    }
}
