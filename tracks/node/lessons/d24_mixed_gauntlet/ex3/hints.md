## Hint 1

`readFile` is not available to you here — the point of a `tail` is that the file
may be gigabytes. `open()` gives you a `FileHandle` with `stat()` for the size
and `read(buffer, offset, length, position)` for reading a block from anywhere
in the file, and a `finally` to close it.

## Hint 2

Walk backwards: start at the end, read a block, prepend it to a list, count the
`0x0a` bytes you have seen, and stop when you have seen more newlines than the
number of lines asked for — the extra one is what proves the first line in your
region is whole. Also stop at the start of the file.

Do not decode a block when you read it. Keep the Buffers, `Buffer.concat` them
once, and decode the result. A block boundary lands inside a multi-byte
character eventually, and decoding either side of the cut gives you replacement
characters in a log line that was perfectly fine on disk.

## Hint 3

The line-ending rules are worth writing down before you code them: a file that
ends with a newline has no empty last line, a file that does not still has a
last line, and a `\r` before the `\n` belongs to the ending rather than to the
text. Three of the gate's cases are exactly those.

What is left for you: whether `n` larger than the file should be an error. The
gate says no — but say so on purpose rather than by accident.
