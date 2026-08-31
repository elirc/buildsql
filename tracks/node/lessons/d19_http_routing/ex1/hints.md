## Hint 1

`new URL(url, "http://localhost")` does most of this. The base is a formality —
`req.url` is always relative, and nothing about the base ends up in your answer.
You then want `parsed.pathname` and `parsed.searchParams`.

## Hint 2

Order matters on the path: **split, then decode**. Decoding first turns a `%2f`
inside a segment into a real separator, and the segment splits into two — which
is the same mistake that lets a filename climb out of a directory.

Dropping the empty strings that `split("/")` produces is what makes a leading
slash, a trailing slash and a doubled slash all mean nothing.

For the query, `searchParams` is already decoded and already knows about
repeats. Iterating it gives you one entry per occurrence, so the array case is a
matter of noticing you have seen the key before — and the three-value case is
what catches a solution that only ever builds a pair.
