## Hint 1

`_read()` is not "produce your data". It is the stream saying *I have room for
more* — Node calls it only while the internal buffer is below the
`highWaterMark`, and stops calling it when the buffer is full.

So the shape is: one item per call, then return. `push(null)` when there is
nothing left.

## Hint 2

The tempting version loops inside `_read` and pushes everything it has. It
works, in the sense that the right items come out in the right order — and it
has bought you nothing at all, because the entire input is now sitting in the
stream's buffer. That is the assertion in the gate: the number produced minus
the number consumed must stay inside the highWaterMark.

`push()` returns a boolean of its own, and it is the same conversation in the
other direction: `false` means the buffer is full and you should stop pushing
until `_read` is called again. Pushing one item per call means you never have to
look at it, which is why it is the shape everybody should start from.
