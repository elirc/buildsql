## Hint 1

An annotation tells the compiler what to *use*; a const assertion tells it what
to *keep*. You want the second, so the annotation has to go.

## Hint 2

`as const` on an object literal does two things at once: no literal is widened,
and every member becomes `readonly`. Both are checked by the gate, and both are
lost the moment an annotation is put back.

Left to you: `Object.freeze` also produces readonly members and does so at
runtime. Work out what it does *not* do that `as const` does, before deciding
they are interchangeable.
