## Hint 1

Find the boundary before you decode anything. `buffer.indexOf(Buffer.from("\r\n\r\n"))`
gives you one number, and that number splits the buffer into a part that is text
and a part that is not.

## Hint 2

Only the head is text. `buffer.toString("utf8", 0, at)` decodes exactly that
range; the body is `subarray(at + 4)` and stays a Buffer for the rest of its
life. The moment you write `buffer.toString()` on the whole thing, every byte
that is not valid UTF-8 becomes a replacement character, the length changes, and
the content-length you already sent is a lie.

Then it is line handling: split the head on CRLF, skip empties, and cut each
line at its **first** colon.

## Hint 3

`indexOf` on the whole line finds the first colon, which is what you want:
`Location: https://example.com:8443/x` has three of them and only the first is a
separator. `line.split(":")` throws away the rest of that URL.

A repeated header is not an error and not a last-one-wins: the field value is
the list, joined with a comma and a space. Whether you should keep the original
order (you should) and what to do with a header whose name has spaces around it
are the two things left for you to decide.
