## Hint 1

Every body here is one line. All the difficulty is in the signatures, so write
the call you want first and let it dictate the types:

```
Bind(divide, 100)      -> a function of ONE argument
Flip(divide)(4, 100)   -> divide(100, 4)
Pipe(f, g)(x)          -> g(f(x))
```

Note which argument `Bind` fixes: the first one.

## Hint 2

```csharp
public static Func<TSecond, TResult> Bind<TFirst, TSecond, TResult>(
    Func<TFirst, TSecond, TResult> f, TFirst first)
{
    return second => f(first, second);
}
```

`Flip` is the same trick with the parameters written in the other order: the
returned delegate is `Func<TSecond, TFirst, TResult>`, and inside it you call
`f(first, second)` with the names as they were.

## Hint 3

For `Pipe`, name the middle type. `f` is `Func<TIn, TMid>` and `g` is
`Func<TMid, TOut>`, so `TMid` appears twice in the parameters and never in the
result - that is what "f ends where g begins" means when written as types. The
body is `x => g(f(x))`.

If the compiler cannot infer the type arguments at a call site, that is not a
bug in your signature; sometimes there genuinely is nothing to infer from, and
the caller writes them out. Decide whether you want `Pipe`'s type parameters in
the order `TIn, TMid, TOut` - the gate calls it explicitly, so the order you
pick has to match the README.
