## Hint 1

The filter is already right. What is missing is the question asked *before* it:
does this station exist at all? Without that check, "no such station" and
"nothing docked here" produce the same bytes.

## Hint 2

`if (D15Network.Find(code) is null) return TypedResults.NotFound();` at the top,
then the existing query with `.OrderBy(b => b.Id)` added. Do not filter out the
bikes in service - a bike in service is standing at the station, it is just not
rentable.
