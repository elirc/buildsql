## Hint 1

Four checks in one handler, and their order is the exercise: existence (404),
then the query string's validity (400), then the work, then the cache (304).
Getting them out of order gives a 400 for a station that does not exist, which
tells the client to fix the wrong thing.

## Hint 2

Reuse what you already wrote. The 404 is ex1's `D15Network.Find`; the 400 is
ex3's membership guard with `D15Network.Models` and the key `"model"`; the ETag
is ex5's `Ex5.Tag(...)` plus the `If-None-Match` comparison.

## Hint 3

Compute the tag from the `StationReport` you just built, not from the code or
the URL. That is what makes `?model=roadster` and the unfiltered call carry
different tags automatically - an entity tag identifies a representation, and
those two are different representations of the same resource.

`models` is `docked.Select(b => b.Model).Distinct().OrderBy(...)` - the distinct
matters, cw01 has two roadsters.
