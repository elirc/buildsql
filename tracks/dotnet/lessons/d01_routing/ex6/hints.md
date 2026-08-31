## Hint 1

Both endpoints are already mapped, in the "wrong" order, and the order does not
matter — that is the thing this exercise wants you to see rather than be told.
Fill in the two handlers and leave the mapping alone.

Two answers to produce: the set of zones, and the stops within one zone.

## Hint 2

`ListZones`: `Select(s => s.Zone).Distinct().OrderBy(...)` over
`Network.Stops`.

`GetZone`: filter on the zone, `Select` the `Name`, sort, and then decide. An
empty list is not an empty zone — it means no such zone, so return
`TypedResults.NotFound()` when `Count == 0`.

Sort with `StringComparer.Ordinal` in both, for the same reason as ex2.
