## Hint 1

A `Duplex` is a Readable and a Writable in one object, and the two halves are
independent. The wiring you want is a cross: side A's `write()` implementation
pushes the chunk into side B's readable half, and vice versa.

## Hint 2

Build both with `new Duplex({ read() {}, write(chunk, encoding, callback) { ... } })`.
The empty `read()` is fine — data arrives by the other side pushing, not by
this side pulling. Referring to `b` inside `a`'s options object works because
the closure runs at write time, not at construction time.

## Hint 3

The half-close is the part interviews poke at: implement `final(callback)` —
which runs when this side is `end()`ed — and have it `push(null)` into the
**other** side. That ends B's readable half when A stops writing, while B's
writable half keeps working, exactly like `shutdown(SHUT_WR)` on a real socket.
Whether ending one side should eventually tear down the whole pair (as
`allowHalfOpen: false` would) is a semantics decision the gate leaves to you.
