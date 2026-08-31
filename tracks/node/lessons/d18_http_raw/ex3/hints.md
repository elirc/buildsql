## Hint 1

Incoming cookies arrive as **one** `Cookie` header holding `name=value` pairs
separated by `; `. Outgoing cookies are **one `Set-Cookie` header each**, and
that asymmetry is the whole exercise.

## Hint 2

Parsing: split on `;`, trim, and split each pair at the **first** `=` with
`indexOf` — not with `split("=")`, which mangles any value that contains one.
A pair with no `=` at all is not a cookie and should be dropped rather than
stored as `undefined`.

Setting: `res.setHeader("set-cookie", [first, second])`. Calling `setHeader`
twice overwrites, which is why the second cookie is the one that survives in the
version of this code everybody writes first. (`res.appendHeader` is the other
way, if you prefer.)

Attributes are joined onto the value with `; ` and are not encoded — only the
value is.
