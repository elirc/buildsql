## Hint 1

`Buffer#indexOf` accepts a Buffer as its needle and a start offset as its second
argument, and it searches **bytes**. That is the whole engine; the rest is a
cursor.

## Hint 2

Loop: find the next delimiter from `start`, push the slice before it, move
`start` past it. When there is no next delimiter, push everything from `start`
to the end — unconditionally. That final push is what produces the empty piece
when the buffer ends on a delimiter, and skipping it is why a blank line stops
terminating a header block.

`subarray` gives you a view over the same memory rather than a copy, which is
the point of doing this in bytes at all. Whether that view outliving the
original buffer is a problem for your caller is a decision worth making on
purpose.
