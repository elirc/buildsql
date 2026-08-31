## Hint 1

Three outcomes, and the order you check them in is the exercise: the line does
not exist at all (404), the line exists but is quiet at that hour (200 with an
empty array), or there are departures (200 with them).

Check the line *before* you filter the departures, or the empty case and the
missing case become indistinguishable.

## Hint 2

`Network.Lines.Contains(line)` is the existence check.

Then filter `Network.Departures` on both route values, `Select` the
`Destination`, and `OrderBy` with `StringComparer.Ordinal` so the sort does not
depend on the machine's culture.

Hour 24 needs no code from you: `range(0,23)` already keeps it out of this
endpoint.
