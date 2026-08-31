## Hint 1

A cursor answers "where was I", and the only durable answer is **the last row I
served** — not an offset. Offsets count from the front of a list that other
people are inserting into, which is why page 2 shows you an item page 1 already
did.

So: decode the cursor to an id, find that id, start one past it.

## Hint 2

`Buffer.from(id).toString("base64url")` and
`Buffer.from(cursor, "base64url").toString("utf8")` are the two halves.
`base64url` rather than `base64` because the value is going into a query string
and `+`, `/` and `=` all have to be escaped there.

Opaque matters: the moment a client can read a cursor, it will build one, and
then you can never change what a cursor contains.

Note what "invalid" means. Decoding never fails — any string is bytes. A cursor
is invalid when the id it names is not in the collection, and that is a 400,
not an empty page and not a silent jump back to the start. And `nextCursor` on
the last page is `null` rather than absent: a missing key and a null one look
the same to a person and different to every JSON parser.
