## Hint 1

Split into words first - that disposes of the whitespace-collapsing rule
entirely - then run one loop that keeps a "current line" buffer.

For each word there are exactly two questions: is the buffer empty (start the
line with this word, however long it is), and does the word still fit
(`current.Length + 1 + word.Length <= width`)?

## Hint 2

`text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)` splits on
any whitespace and throws away the empty entries, so `"  a   b "` gives
`["a", "b"]`.

The `+ 1` in the fit test is the space you are about to add. Forgetting it
produces lines one character too long, which is the classic off-by-one here.

Do not forget the last line: when the loop ends there is still text in the
buffer, and it only gets added if you say so. The empty-input case falls out of
that - the buffer is empty, so nothing is added.

Left to you: whether an over-long word gets its own line by luck (the buffer is
empty, so it starts the line) or by an explicit branch. Both work; know which
one you wrote.
