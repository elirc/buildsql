## Hint 1

The lambda you return uses `rate`, which is a parameter of `MakeDiscounter`.
That parameter would normally cease to exist when the method returns; because a
lambda uses it, the compiler keeps it alive for as long as the lambda lives.
That is a closure, and it is why nothing has to be stored in a field.

Work out the arithmetic on paper: a rate of `0.25m` applied to `100m` must give
`75m`.

## Hint 2

```csharp
public static Func<decimal, decimal> MakeDiscounter(decimal rate)
{
    return price => price * (1m - rate);
}
```

Each *call* to `MakeDiscounter` gets its own `rate` variable, so each returned
lambda closes over a different one - which is why two discounters do not
interfere. Contrast that with capturing a loop variable, where every iteration
shares one variable unless the loop gives you a fresh one.

`MakeTagger` is the same shape with an interpolated string. Mind the single
space after the closing bracket.
