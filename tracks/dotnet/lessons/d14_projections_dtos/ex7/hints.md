## Hint 1

Two tables, two queries, one wire shape. Validate first and return early;
then project films into `SearchHit`s and directors into `SearchHit`s
separately, and join the two lists in memory - the ordering the contract asks
for is "all films, then all directors", which `Concat` gives you directly.

## Hint 2

`TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["q"] =
["..."] })` is the 400. `BadRequest("...")` has the right status and the wrong
body - the gate reads the `errors` dictionary.

## Hint 3

For the match, `EF.Functions.Like(f.Title, $"%{term}%")` keeps the comparison
in SQL, and SQLite's `LIKE` is already case-insensitive for ASCII, so `VALE`
finds `Mira Vale` without any `ToLower()`. Use `string.IsNullOrWhiteSpace(q)`
for the guard, so a `q` of one space is rejected too.
