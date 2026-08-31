## Hint 1

`where T : class, new()` says T is a reference type with a public parameterless
constructor - which is what lets the pool write `new T()` without knowing
anything else about it.

The pool needs two counters and one stack of returned items. `Rent` either
reuses something returned earlier or makes a new one; `Return` puts it back.

## Hint 2

```csharp
if (_available.Count > 0) return _available.Pop();
if (Created >= _max) throw new InvalidOperationException("The pool is exhausted.");
Created++;
return new T();
```

The order matters: check the free list *before* the limit, or a pool at its
maximum refuses to hand back something it already owns.

`Created` counts objects ever constructed, not objects currently out - which is
what makes the gate able to see that renting, returning and renting again
constructs only once.

`InvalidOperationException` rather than an argument exception, for the reason
from d05 ex8: every argument was fine, the *object's state* is the problem.

Left to you: what `Return` should do with an item the pool never created, or
with the same item twice. Real pools either track ownership or document that
double-returning is undefined; nothing here checks, and knowing that is part of
the answer.
