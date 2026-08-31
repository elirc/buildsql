## Hint 1

`GetOrAdd(key, factory)` is the whole class: look the key up; if it is there,
return it; if not, call the factory, store the answer, return it.

The factory takes the key and returns a value - `Func<TKey, TValue>` - which is
what lets one memo serve many keys with a single function.

`FactoryCalls` must count only the times the factory really ran.

## Hint 2

```csharp
if (_values.TryGetValue(key, out TValue? existing)) return existing;
FactoryCalls++;
TValue created = factory(key);
_values[key] = created;
return created;
```

Two details worth defending. First, the factory is called *outside* the
dictionary write, so a factory that throws leaves the memo unchanged and the
next call tries again - the same rule as d09 ex8's caching decorator. Second,
`FactoryCalls` is incremented before the call rather than after, so a throwing
factory still counts as an attempt; incrementing afterwards would be equally
defensible and you should know which you chose.

`where TKey : notnull` is required by `Dictionary<TKey, TValue>`.

Left to you: this memo never forgets, which for an unbounded key space is a
memory leak with a friendly name. Say what you would add - a size limit, an
LRU policy, weak references - and why you did not add it here.
