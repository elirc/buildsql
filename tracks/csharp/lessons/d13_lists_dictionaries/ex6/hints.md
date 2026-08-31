## Hint 1

A value tuple `(from, to)` is a complete dictionary key: it compares by
position with value equality and hashes to match, so no custom type is
needed. `Set` is the indexer; `PriceOf` is `TryGetValue` with the tuple key,
turning the miss into `null`.

## Hint 2

`CheapestFrom` is a scan of the pairs, not a lookup: filter on
`pair.Key.From == origin`, then `OrderBy(pair => pair.Value)` with
`.ThenBy(pair => pair.Key.To)` for the tie, select the destination, and let
`FirstOrDefault()` produce the null when nothing matched.
