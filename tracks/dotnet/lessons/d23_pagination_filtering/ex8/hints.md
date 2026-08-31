## Hint 1

Three phases, in order: validate everything, build one filtered query, then
answer from it. The new idea is only in the first phase - validation here is a
*report*, not a tripwire. A request with five mistakes should learn about all
five at once.

## Hint 2

Collect into a dictionary instead of returning early:

    var errors = new Dictionary<string, string[]>();
    if (p < 1) errors["page"] = [...];
    ...
    if (errors.Count > 0) return TypedResults.ValidationProblem(errors);

Note which checks are conditional: `location` is only wrong if it was supplied
*and* is outside `D23Board.Locations`, and an absent `minSalary` is not a
negative one.

Then compose the ex4 filters onto one `IQueryable`, `CountAsync` it, apply the
ex3 ordering, and page it - two commands, both over the same filtered query, so
`total` describes the rows the page came out of.

## Hint 3

The links are where this exercise is actually won. A `next` that is only
`?page=2&size=10` points at page 2 of a *different* result set, and the client
lands in unfiltered data with nothing reporting an error.

Write one local function that rebuilds the whole query string for a target page
in the README's order - page, size, sort, remote, location, minSalary, tag -
appending each optional parameter only when the client supplied it. Two details
the gate compares literally: `bool.ToString()` gives `True`, so write
`remote ? "true" : "false"` yourself, and an empty result has `totalPages` 0,
which makes both links null through the same `page < totalPages` test you used
in ex5.
