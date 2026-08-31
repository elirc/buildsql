## Hint 1

`return await task()` inside a `try` is the shape. Without the `await`, the
promise is returned before it can reject and the `catch` never runs - which is
the one place where `return await` is not redundant.

## Hint 2

Keep the last error in a variable typed `unknown` (`useUnknownInCatchVariables`
gives you that anyway) and rethrow it after the loop, so the caller sees the
real failure rather than a message you invented.

Left to you: what `attempts` of 0 should do. The gate does not ask; decide
whether it means "never call" or "call once", and make the loop say so.
