## Hint 1

`Dispose` has one hard rule: **calling it twice must be harmless.** A guard
flag checked at the top of the method is the whole implementation.

The scope owns its children, so disposing the scope disposes them - in reverse
order, because a resource created later may depend on one created earlier.
That is the same order nested `using` blocks unwind in.

## Hint 2

```csharp
if (Disposed) return;
Disposed = true;
```

Set the flag *before* doing the work, not after: it makes the method safe
against a child whose `Dispose` somehow calls back into the scope.

Reverse iteration is the loop from d03 ex3:

```csharp
for (int i = _children.Count - 1; i >= 0; i--) _children[i].Dispose();
```

`ObjectDisposedException.ThrowIf(Disposed, this)` (since .NET 7) is the modern
one-liner for the `Add` guard.

Left to you: what should happen if one child's `Dispose` throws. This exercise
does not test it, and the production answer is that you should still dispose
the rest and then rethrow - which is why real container code wraps the loop in
a try/finally or collects the exceptions. Have an answer ready.
