## Hint 1

A property with a body is just two methods wearing a friendly syntax: the
getter runs when someone reads, the setter runs when someone assigns. Inside
the setter, the incoming value is called `value` — a keyword you never declare.

The field `_celsius` already exists and already starts at 20. Your getter hands
it back; your setter decides what is allowed to go into it.

## Hint 2

Clamping means "if it is below the floor use the floor, if it is above the
ceiling use the ceiling, otherwise leave it alone". `Math.Clamp(value, low, high)`
does exactly that in one call, and `Minimum` and `Maximum` are already declared
as constants above.

Expression-bodied accessors are the compact form:

```csharp
public int Celsius
{
    get => _celsius;
    set => /* the guarded assignment */;
}
```

## Hint 3

`Fahrenheit` is `celsius * 9 / 5 + 32`, and the trap is integer division: with
`int` values, `21 * 9 / 5` is 37 and you have lost the 0.8 before you round
anything. Do the arithmetic in `double` — `9.0 / 5.0` is enough to promote the
whole expression — then round away from zero and cast back to `int`, exactly as
in lesson 01 ex2.

There is no setter for `Fahrenheit`, so it cannot drift out of step with
`Celsius`. Deriving instead of storing is why.
