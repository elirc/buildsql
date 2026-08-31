## Hint 1

The stub builds an `AbortController`, hands over its signal and then forgets
about it — which is exactly as useful as not building one. Whoever creates the
controller has to keep it long enough to abort it.

## Hint 2

One controller per run of the effect, created in the effect body, aborted in
the cleanup. Once you have it, notice that `controller.signal.aborted` already
answers the question your `let` flag was answering, so you do not need both.

## Hint 3

Aborting makes the request reject. That rejection is your own doing, not a
failure the user needs to hear about — the error branch has to check whether
this request was aborted before it announces anything.
