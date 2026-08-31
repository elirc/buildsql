## Hint 1

A `HashSet<T>` puts each item in a bucket chosen by its hash code, once, when
the item goes in. It never looks again.

So if the item's hash changes afterwards, every later lookup computes the
*new* hash, goes to the *wrong* bucket, and finds nothing - while the item is
still sitting in the set, counted by `Count`, and reachable only by
enumerating.

## Hint 2

Write the four methods exactly as described - the point is to watch it happen,
not to prevent it:

```csharp
HashSet<MutableKey> set = new HashSet<MutableKey> { key };
key.Name = "changed";
return set.Contains(key);   // false
```

Predict all four answers before you run the gate. The surprising one is
`FoundByOldName`: constructing a *fresh* key with the original name hashes to
the right bucket, but the object living there now has the new name, so `Equals`
says no. The entry is unreachable by any key at all.

The rule this teaches: **anything used as a dictionary key or set member must
be immutable in the parts that decide its hash.** `record` types with `init`
components, `string`, and value tuples of those are safe. A class with public
setters is not, and no amount of care at the call site fixes it.
