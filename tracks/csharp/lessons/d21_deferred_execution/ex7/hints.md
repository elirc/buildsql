## Hint 1

Two requirements pull in opposite directions. "Enumerate the source at most
once" says copy it; "read nothing until asked, and only what is asked" says do
not.

The resolution is to keep the source's *enumerator* and a cache list, and fill
the cache one item at a time as somebody asks for it.

## Hint 2

`GetEnumerator` can itself be an iterator - it may contain `yield return`. So
the shape is a loop with an index:

```csharp
int index = 0;
while (true)
{
    if (index < _cache.Count) { yield return _cache[index]; index++; continue; }
    // otherwise: is there another item to pull from the source?
}
```

When the index runs past the cache, ask `_source.MoveNext()`. If it produced
something, add it to the cache and let the loop go round again - it will now
find it. If it did not, the source is exhausted and this enumeration is over.

## Hint 3

Two enumerators of the same wrapper share `_cache` and `_source`, which is
exactly what the gate's interleaved test checks: the second enumerator's first
item is already in the list, so no second read happens.

Remember to `Dispose` the source enumerator when it runs out, and set a flag
(or null the field) so a later enumeration does not call `MoveNext` on a
finished enumerator. `Cached` is just `_cache.Count`, which is why the gate can
watch the cache fill up.

One thing this deliberately does not do is work across threads. Making it safe
for two threads is a genuinely harder problem - worth knowing that you have not
solved it rather than assuming you have.
