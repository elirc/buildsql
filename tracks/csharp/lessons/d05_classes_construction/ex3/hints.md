## Hint 1

A private constructor plus public static factory methods is the "named
constructor" pattern. Its point is right here in the signatures:
`new Temperature(20)` cannot say which scale 20 is in, but
`Temperature.FromCelsius(20)` can only mean one thing.

The constructor is written for you. You write the two factories and the
computed property.

## Hint 2

`FromFahrenheit` should convert and then call `FromCelsius`, not repeat the
range check:

```csharp
return FromCelsius((fahrenheit - 32) * 5 / 9);
```

That way the absolute-zero rule exists in exactly one place, and the gate's
`FromFahrenheit(-500)` case passes without you writing anything for it.

Watch the arithmetic types: `(fahrenheit - 32) * 5 / 9` is all `double` because
`fahrenheit` is, so there is no integer division here. If you had written this
with `int` temperatures, `5 / 9` would be 0 and every answer would be 32 -
which is d01 ex2's trap in a new costume.
