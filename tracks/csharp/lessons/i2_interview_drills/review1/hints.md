## Hint 1

This is ex2's idea with the difficulty removed: the same "most recently used
first, no duplicates, bounded length" behaviour, over a plain `List<string>`.

`Touch` is three steps in a fixed order. Say them out loud: remove it if it is
already there, put it at the front, drop the oldest if that took you over the
limit.

## Hint 2

```csharp
_items.Remove(item);      // no-op when it is not there
_items.Insert(0, item);
if (_items.Count > Capacity) { _items.RemoveAt(_items.Count - 1); }
```

`List<T>.Remove` returns a bool you can ignore, and does nothing if the item is
absent — which is why the dedupe needs no `if`.

`Items` should hand back something the caller cannot mutate: `_items.AsReadOnly()`.

## Hint 3

The performance answer, if asked: this is O(n) per touch because `Remove` and
`Insert(0, ...)` both shift the list. For a "recently opened files" menu of ten
entries that is completely fine, and reaching for a linked list plus a
dictionary here would be over-engineering. Knowing *when* the O(1) version
(ex2's) is worth the complexity is the actual skill.

Left to you: whether the eviction should happen before or after the insert. Both
orders can be made correct; only one of them is correct with the code above.
Work out which, and why.
