## Hint 1

Two different things can be wrong with a page number, and only one of them is
the client's fault. `page=0` is out of *range* - no such page can exist, so
400. `page=4` of a three page result is out of *bounds* - a perfectly legal
request whose window happens to land past the end, so 200 with nothing in it.

## Hint 2

Build the envelope exactly as in ex2, then add the two links last, from the
effective `page` and `size`:

- `prev` when `page > 1`, pointing at `page - 1`
- `next` when `page < totalPages`, pointing at `page + 1`
- `null` otherwise, and `null` means `null`, not `""`

Those two conditions already give you the right answers for page 4 of 3 -
`4 < 3` is false, so `next` is null, and `4 > 1` is true, so `prev` still
exists. Interpolate the size the caller used into both links; a literal
`size=10` resets the page size on the first click.
