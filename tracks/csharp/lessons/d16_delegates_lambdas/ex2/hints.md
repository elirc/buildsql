## Hint 1

Both methods return a predicate, so the body is a single `return item => ...;`.
Nothing is evaluated at the moment `Both` is called - `first` and `second` are
only invoked when somebody calls the predicate you handed back.

The short-circuit requirement is not extra work. It is one character.

## Hint 2

```csharp
public static Func<T, bool> Both<T>(Func<T, bool> first, Func<T, bool> second)
{
    return item => first(item) && second(item);
}
```

`&&` evaluates its right operand only when the left one was true; `&` always
evaluates both. That difference is the entire exercise, and the gate proves it
by counting how often the second predicate ran.

`Either` is the same shape with the other operator. Decide for yourself whether
you want to guard against a null `first` or `second` here - the gate never
passes null, but real combinator libraries usually do check.
