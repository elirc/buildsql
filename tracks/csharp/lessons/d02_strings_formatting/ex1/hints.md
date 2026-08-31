## Hint 1

Three built-ins do almost all of this: `PadRight(width)`, `Substring(start,
length)` and the `new string(char, count)` constructor. Nothing here needs a
loop.

Decide the three cases before you type: shorter than the field, exactly the
field, longer than the field.

## Hint 2

For `Fit`, note that the ellipsis is part of the width, not extra:

```csharp
return text.Substring(0, width - 3) + "...";
```

so the result is always exactly `width` characters. `PadRight` already returns
the string unchanged when it is long enough, which folds two of your three
cases into one line.

For `Center`, compute the total padding once and give the remainder to the
right: `int left = padding / 2;` then `padding - left` on the other side.
Integer division is doing the "odd space goes right" rule for you.
