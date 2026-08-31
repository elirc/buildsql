## Hint 1

`async function*` gives you `yield` and `for await` in the same body. Accumulate
into an array, `yield` it when it is full, and deal with the leftovers after the
loop.

The `if` after the loop is what makes the last chunk short rather than lost —
and the same `if` is what stops an empty source yielding one empty array.

## Hint 2

After yielding a full chunk, replace the array rather than emptying it. The
consumer now holds a reference to the array you just handed over; clearing it in
place mutates *their* value, and the bug shows up as chunks that are empty by
the time anybody looks at them.

## Hint 3

The cleanup requirement needs no code, but it does need you to see why it works.

When the consumer breaks out of `for await (const chunk of chunked(...))`, the
generator's `return()` is called, which resumes the generator at the paused
`yield` with a return completion. That unwinds the `for await` inside your
generator abruptly, which calls the **source's** `return()`.

Break, generator, source: three links, all automatic — as long as the middle one
is a `for await` and not a hand-driven `.next()` loop.
