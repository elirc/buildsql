## Hint 1

A normal route parameter matches exactly one segment, which is why
`/d01/tiles/a/b/c.png` currently 404s. There is a spelling of a route parameter
that matches the entire remainder of the path, slashes included.

The handler itself is four lines once the template is right.

## Hint 2

`{**path}` is the catch-all. It also matches *zero* segments, so `/d01/tiles`
reaches the handler with `path` bound to `null`.

Coalesce first (`path ?? ""`), then count with
`value.Split('/', StringSplitOptions.RemoveEmptyEntries).Length` — the option is
what keeps a stray trailing slash from counting as a segment.
