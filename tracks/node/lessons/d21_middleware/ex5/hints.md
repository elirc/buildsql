## Hint 1

`express.json()` takes options, and two of them matter here: `limit` (bytes, or
a string like `"200b"`) and `type` (which content-types it will parse at all).

When it refuses a body it does so by calling `next(error)`, and those errors are
tagged: `error.type` is `"entity.too.large"` or `"entity.parse.failed"`. Switch
on that, not on the message.

## Hint 2

The two cases the parser does **not** raise are the interesting half of this
problem.

A content-type it was not configured for is not an error to it — it simply does
not parse, and leaves `req.body` as `undefined`. Nothing warns you; the first
symptom is a handler reading a property off undefined. That check, and the 415,
are yours.

An empty body with the right content-type *is* parsed, into an empty object. So
`req.body === undefined` and `Object.keys(req.body).length === 0` are two
different questions with two different answers, and you need both.
