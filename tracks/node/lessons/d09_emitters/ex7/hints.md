## Hint 1

Three pieces of state: the listeners, the buffer, and the timer handle for the
open window. `push` appends and then arms a timer **only if one is not already
armed**.

That "only if" is the whole difference between this and d04's debounce. A
debounce restarts its timer on every call, so a producer that never pauses can
delay a value indefinitely. A coalescing window is measured from the first push,
so every value is delivered within `windowMs` of arriving no matter how busy
things get.

## Hint 2

Write one `deliver()` and use it for both the timer callback and `flush()`. It
has to: clear any armed timer, do nothing at all if the buffer is empty, and
otherwise take the buffer, replace it with a fresh array, and hand the old one
to every listener.

Replacing rather than emptying matters for the same reason as d06's chunked
generator: the listeners are holding the array you just gave them.

## Hint 3

Two timer facts the gate checks by counting.

After a window closes, nothing is re-armed — the next push opens the next
window. An emitter that always keeps a timer alive stops a Node process from
exiting.

And `flush()` cancels the pending window as well as delivering, or the batch
goes out twice: once now and once when the timer catches up to an empty buffer.
The empty-buffer guard covers you there too, which is a good example of two
correct defences making the code obviously right rather than merely right.
