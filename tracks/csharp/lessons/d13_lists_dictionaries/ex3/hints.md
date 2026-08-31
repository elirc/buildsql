## Hint 1

Three write styles: the indexer `offices[person] = office` always succeeds
(add or overwrite); `Add` throws when the key exists; `TryAdd` adds only when
absent and returns whether it did. Match each method to its contract. For
`OccupantsOf`, remember a dictionary only speeds up lookups BY KEY - finding
by value is a scan over the pairs.

## Hint 2

`AssignNew` is one line: `return offices.TryAdd(person, office);` (or
`ContainsKey` then `Add`). `OccupantsOf` filters pairs on `pair.Value ==
office`, selects `pair.Key`, orders with `OrderBy`, and `ToList()`s.
