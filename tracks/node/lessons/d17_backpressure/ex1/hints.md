## Hint 1

`writable.write(chunk)` returns a boolean, and it is the only thing a stream
ever tells you about how full it is. `true` means there is room — resolve
immediately, and do not attach a single listener. `false` means the buffer is at
or over its `highWaterMark`, and the stream will emit `drain` when it has
emptied.

Note what `true` does **not** mean: it does not mean the chunk was written. The
sink in the gate is still holding that chunk when the promise resolves.

## Hint 2

The `false` branch is a promise around one event, and the whole exercise is the
paths you have to cover besides the happy one. A stream that errors, or is
destroyed, will never emit `drain` — so a promise that only listens for `drain`
is a promise that is never settled, and an upload that hangs for ever with
nothing in the logs.

Listen for `error` (and `close`) alongside it, and remove **all** of them from a
single cleanup function whichever one fires. `once()` removes only the listener
that fired; the other two are still attached, and one leaked listener per chunk
is a `MaxListenersExceededWarning` a few thousand chunks later.
