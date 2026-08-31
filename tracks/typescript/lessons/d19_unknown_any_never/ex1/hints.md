## Hint 1

The whole exercise is the return type. `JSON.parse` gives you `any`; declaring
the function as returning `unknown` converts it at the boundary, and every
caller then has to narrow before using it.

## Hint 2

Do not catch the parse error. The prompt says invalid JSON throws, and
returning `null` instead would be indistinguishable from parsing the text
`"null"`.

Left to you: whether to write `as unknown` on the `JSON.parse` call. The
declared return type is enough on its own; the cast is a note to the next
reader.
