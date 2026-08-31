## Hint 1

Ask what a short-circuit is *for*. The guard exists so that the work it protects
does not happen — which is only true if the work is inside it.

Swap two lines.

## Hint 2

`KeyGuardMiddleware` first, `ExpensiveMiddleware` second.

The gate checks the *absence* of the `expensive` mark on the rejected request,
because that is the only way to tell a real short-circuit from a middleware that
sets a 401 and then calls `next` anyway — the status code looks identical.

Notice the rejected trace stops at `guard>`: the guard returns before reaching
its own closing mark, which is the same mechanism ex7 is about.
