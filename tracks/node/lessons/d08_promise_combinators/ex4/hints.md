## Hint 1

Start from your ex1 and add three lines. The counter you already have is the
`done` number; the total is the input length; the callback goes in the
fulfilment handler.

The interesting part is that this function deals in **two orders at once**, and
each has its own mechanism: the results are written by index, and the progress
is reported as things arrive.

## Hint 2

Watch the direction of the counter. ex1 counted *down* to zero; a progress
report wants to count *up*, so either flip it or derive one from the other.
Reporting `total - remaining` works and is one more place for an off-by-one to
live.

## Hint 3

Two edge decisions the gate pins down.

An empty input reports nothing — not even `onProgress(0, 0)`. The natural
implementation gives you that for free as long as the empty case returns before
any callback is wired up.

And the callback is *not* wrapped in a `try`. If a progress reporter throws, the
whole call should fail: it is your code, and a broken progress bar that silently
eats its own exception is worse than one that stops. The remaining decision is
whether a rejection should also count as progress — the specification here says
no, and there is a reasonable argument for yes.
