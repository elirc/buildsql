## Hint 1

Three parameters, three different places in the request: the path, the query
string, and a header. Two of those the framework can guess; one of them it never
guesses. And one of the guessable ones is guessing *wrong*, because the name in
the URL is not the name in your C#.

Say what you mean on all three, then write the filtering.

## Hint 2

The attributes live in `Microsoft.AspNetCore.Mvc` (already imported in the
stub): `[FromRoute]`, `[FromQuery(Name = "q")]`, `[FromHeader(Name = "X-Zone")]`.

The `Name` argument is the whole point of the exercise — without it the
parameter binds by its C# name, so `?q=ar` does nothing and `?term=ar` does
something, which is precisely backwards.

Then: reject an unknown scope with `TypedResults.BadRequest(...)`, build the
candidate names (`Network.Lines`, or stop names narrowed by zone when the header
is present), filter with
`Contains(term, StringComparison.OrdinalIgnoreCase)` when there is a term, and
sort.

## Hint 3

Build the candidates as an `IEnumerable<string>` and layer the filters onto it,
rather than writing four near-identical LINQ queries:

```csharp
IEnumerable<string> candidates = scope == "lines"
    ? Network.Lines
    : Network.Stops.Where(s => zone is null || s.Zone == zone).Select(s => s.Name);
```

`zone is null || …` is what makes an absent header mean "no filter" instead of
"match the empty zone".

Left for you: the exact shape of the response record, and whether `term` and
`zone` are echoed as sent or as resolved. The gate expects them as sent.
