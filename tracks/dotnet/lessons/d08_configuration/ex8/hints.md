## Hint 1

Three lookups in order, and the first one that has a value wins. Build the two
keys with string interpolation — the environment name is part of the path.

The name has to come from `IHostEnvironment`, because the gate boots the same
configuration twice under two different names.

## Hint 2

```csharp
string name = environment.EnvironmentName;

string? specific = configuration[$"Dojo:D08:Overrides:{name}:{key}"];
string? fallback = configuration[$"Dojo:D08:Overrides:Default:{key}"];
```

Check `specific` first, then `fallback`, then give up with `"none"` — and report
which branch answered in `source`.

`string.IsNullOrEmpty` rather than `is not null`: a key present with an empty
value should behave like an absent one here.

## Hint 3

Write the three returns as three early exits rather than a nested conditional —
the chain reads as the rule it implements, and adding a fourth layer later is
one more block instead of a rewrite.

Two things worth taking away once it passes. The framework already does this at
the *file* level (`appsettings.json` then
`appsettings.{Environment}.json`), so reach for that before building a chain in
configuration; this shape earns its keep when the branching is per-key — a
tenant, a region, a rollout ring — which file layering cannot express.

And the `source` field is the part to steal. When a value is wrong in
production, "what is it" is half the question and "where did it come from" is
the half that costs you an afternoon.
