## Hint 1

Parse the header into one of three answers before you touch the response: there
is no usable range (serve everything), there is a range (206), or the range
cannot be satisfied (416). A discriminated union makes the three branches
impossible to confuse.

## Hint 2

`bytes=` is the only unit you support, and anything else — including a unit you
have never heard of — means "ignore the header", not "refuse the request". Then
there are three shapes after the `=`:

- `start-end` — clamp `end` to the last byte, and refuse if `start` is past it
- `start-` — runs to the end
- `-suffix` — the **last** `suffix` bytes, so the start is `size - suffix`

Both ends of `Content-Range` are inclusive, which makes the slice `end + 1` and
the length `end - start + 1`. Off by one here is a corrupt download rather than
an error, so it is worth checking twice.

A 416 still has to say `bytes */size`, or the client has no way to ask a better
question next time.
