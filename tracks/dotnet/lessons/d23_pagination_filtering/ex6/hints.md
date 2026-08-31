## Hint 1

An offset says "skip ten rows"; a cursor says "resume after this row". The
cursor here is the pair `(PostedDay, Id)`, which is also the sort order - that
is not a coincidence, it is the requirement. A keyset cursor only works over
the exact ordering it was cut for.

## Hint 2

The predicate is the whole key, not its first column:

    x.PostedDay > day || (x.PostedDay == day && x.Id > id)

Postings 1 and 4 both sit on day 12, so `PostedDay > 12` alone drops posting 4
out of the feed permanently. Use `D23Cursor.TryDecode` to get `day` and `id`,
and `D23Cursor.Encode` to build the next one - the gate encodes the cursors it
sends with the same helpers, so a home-made format will not round trip.

## Hint 3

For `nextCursor`, you need to know whether anything follows this page, and the
budget is one query. Ask for `size + 1` rows: if you get them all back, there
is a next page - drop the extra row, return `size` of them, and cut the cursor
from the last row you kept. If you got `size` or fewer, this is the end and
`nextCursor` is `null`.
