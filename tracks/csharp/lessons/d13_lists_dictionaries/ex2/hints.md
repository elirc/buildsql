## Hint 1

Restock is the add-or-accumulate idiom: read the current count treating a
missing key as 0, add, write back through the indexer. `GetValueOrDefault`
gives you the 0 for free. Take must decide everything BEFORE mutating: read
once, refuse if missing or short, then either subtract or remove the key.

## Hint 2

```csharp
stock[item] = stock.GetValueOrDefault(item) + quantity;
```

In `Take`, `TryGetValue(item, out int available)` answers both "is it there?"
and "how many?". Refuse when it is absent or `available < quantity`. When
`available == quantity`, call `stock.Remove(item)` instead of writing a zero.
