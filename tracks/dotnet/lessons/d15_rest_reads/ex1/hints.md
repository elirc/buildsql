## Hint 1

Two independent problems in one file. The collection has to sort and to project
into `StationCard` - `Station` has no `available` field, so serializing it can
never satisfy the gate. The item has to answer "there is no such station"
without throwing.

## Hint 2

`OrderBy(s => s.Code, StringComparer.Ordinal)` then `Select` into a
`StationCard`, using `D15Network.AvailableAt(s.Code)` for the last field.

For the item, swap `First` for `FirstOrDefault` (or the given
`D15Network.Find`) and return `TypedResults.NotFound()` when it comes back
null. An exception is a 500, which claims the fault is yours.
