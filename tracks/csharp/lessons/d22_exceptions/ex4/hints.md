## Hint 1

Compare the supplied `Losing` with what you need to write. The body is the same
except for one statement, and the difference is one word long.

`Wrapping` is a different decision: a new exception, with the old one attached.

## Hint 2

```csharp
throw ex;   // rethrows the object, and resets its stack trace to THIS line
throw;      // rethrows the exception in flight, trace intact
```

Inside a `catch` block a bare `throw;` is legal and means the second thing.
Outside one it is not.

For `Wrapping`, the constructor's second argument is what keeps the evidence:

```csharp
throw new InvalidOperationException("wrapped", ex);
```

Wrapping is the right move when you are adding context a caller needs - a type
that means something in your layer - and the wrong move when you are only
renaming the problem. Either way the original goes in `InnerException`, and a
wrapper that omits it is strictly worse than not wrapping at all.
