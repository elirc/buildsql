## Hint 1

Put the validation in the constructors. Once every `Rect` that exists is a
valid one, nothing downstream has to check - which is most of what constructors
are for.

`Describe` needs the runtime type, and a switch expression over type patterns
is the shortest way to ask.

## Hint 2

```csharp
string kind = shape switch
{
    Rect => "rect",
    Circle => "circle",
    _ => "shape",
};
```

The discard arm is not padding: the gate hands you a `Shape` subclass this
switch has never heard of, and a pattern switch with no match throws.

For the number, `Math.Round(area, 2)` and then
`.ToString(CultureInfo.InvariantCulture)`. The culture matters more than it
looks - a plain `ToString()` uses the machine's current culture, so the same
code prints `12,57` in half of Europe and every string comparison in your tests
stops working.

`TotalArea` rounds once, at the end, rather than rounding each shape and adding
the errors up.
