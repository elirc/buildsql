## Hint 1

An indexer is a property called `this` with parameters:
`public string this[string key] { get => ...; set => ...; }`. It is the right
shape whenever a type *is* a lookup, and the wrong shape whenever the argument
is really an option rather than a key.

Two dictionaries: the defaults (copied in, never changed) and the overrides
(the only thing that ever moves).

## Hint 2

The getter is two `TryGetValue` calls in priority order - override, default,
then `""`.

The setter has the twist:

```csharp
if (_defaults.TryGetValue(key, out string? shipped) && shipped == value)
{
    _overrides.Remove(key);
    return;
}
_overrides[key] = value;
```

Storing an override identical to the default would leave the settings screen
showing a modification that is not a modification, and `Reset` would have
nothing to do. Comparing against the default first is what keeps `IsModified`
honest.

`ModifiedKeys` needs a defined order, because `Dictionary<,>` promises none:
`_overrides.Keys.OrderBy(k => k, StringComparer.Ordinal).ToList()`.

Left to you: whether a key with no default should be storable at all. This
specification allows it; a stricter one would throw `KeyNotFoundException`, and
which you choose depends on whether the settings file is a closed schema.
