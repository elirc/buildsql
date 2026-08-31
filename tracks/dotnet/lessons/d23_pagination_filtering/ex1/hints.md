## Hint 1

Two separate jobs live in this handler. One is arithmetic: how many rows does
page N skip? Page 1 is the *first* page, so the answer for it is zero. The
other is a vocabulary check of the kind you already did for `?status=` in d15 -
`page` and `size` are values the client invented and each has a legal range.

## Hint 2

Bind the defaults with `??` first, then range check the values you ended up
with, then build the query. `Skip` takes the number of rows to skip, not the
page number, and the ceiling for `size` is `D23Board.MaxSize`.

`TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["page"] =
[...] })` is the 400 - the dictionary key is what tells the client *which*
parameter it got wrong.

And `OrderBy` is not decoration: `LIMIT`/`OFFSET` over an unordered set is
undefined, so the ordering has to be in the query, not in the seed.
