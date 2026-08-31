## Hint 1

A decorator implements the same interface as the thing it wraps and holds a
reference to it. Callers holding the interface cannot tell the difference,
which is what lets you add caching, logging, retries or metrics without
changing either the caller or the real implementation.

`CachingPriceSource.PriceOf` has exactly two paths: in the cache (a hit), or
not (a miss, delegate, remember).

## Hint 2

```csharp
if (_cache.TryGetValue(sku, out decimal cached)) { Hits++; return cached; }
Misses++;
decimal price = _inner.PriceOf(sku);
_cache[sku] = price;
return price;
```

The order of the last three lines is the exercise. `_inner.PriceOf` throws for
an unknown sku, so the assignment to `_cache` never runs and the failure is not
remembered - which is what the gate's repeated `"zz"` lookups check. Caching a
failure would mean that adding the missing price later never takes effect.

`TablePriceSource.Lookups` is incremented *before* the dictionary is consulted,
so failed asks are counted too - which is what makes the cache's behaviour
visible from outside.

Left to you: whether "not found" should really be an exception here.
`TryPriceOf(sku, out price)` would let the decorator cache the absence as well
- a better design for a real price service, and worth saying so.
