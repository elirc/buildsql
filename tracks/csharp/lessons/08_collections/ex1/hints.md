## Hint 1

Two bodies, and both of them are about the same awkward moment: what happens
when the key is not there yet.

In `Count`, the first time you see a word there is no entry to add 1 to. In
`CountOf`, the caller may ask about a word that never appeared. A `Dictionary`
throws `KeyNotFoundException` if you index a missing key, so both need a
different move.

## Hint 2

Splitting is lesson 02's `Split(' ', StringSplitOptions.RemoveEmptyEntries)`,
and lower-casing is `ToLowerInvariant()` — culture-independent, as in lesson 02
ex3.

The idiomatic counting move:

```csharp
counts.TryGetValue(key, out int soFar);   // soFar is 0 when the key is missing
counts[key] = soFar + 1;
```

`TryGetValue` writes `default(TValue)` into the out parameter when it finds
nothing, and `default(int)` is 0 — which is exactly the starting count you
wanted, so you can ignore the bool it returns.

## Hint 3

Assigning with the indexer (`counts[key] = ...`) *adds or overwrites*, while
`counts.Add(key, ...)` throws if the key already exists. For counting you want
the first.

`CountOf` can be the same `TryGetValue` with the bool actually used, or the
shorter `counts.GetValueOrDefault(word)` — look that one up; it exists exactly
for this, and knowing it is there is worth more than the two lines it saves.

Left to you: whether to construct the dictionary with
`new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)` instead of
lower-casing the keys. That is how you would do it in production. The gate is
happy either way, but the keys it reads back must be lower-case.
