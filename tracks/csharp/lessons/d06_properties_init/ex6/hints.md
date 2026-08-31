## Hint 1

The setter validates and then assigns - in that order, so a rejected value
cannot half-apply. The gate checks the old value is still there after a failed
assignment, which is only true if you throw before touching the field.

`Strength` is four independent yes/no questions added together. It reads the
field; it never stores anything.

## Hint 2

```csharp
set
{
    if (value is null || value.Length < 8)
        throw new ArgumentException("A password is at least 8 characters.", nameof(value));
    _value = value;
}
```

`nameof(value)` is the right parameter name here - inside a setter the implicit
parameter really is called `value`.

For the score, `char` has the predicates you need and they can be passed as
method groups:

```csharp
if (_value.Any(char.IsDigit)) score++;
if (_value.Any(char.IsUpper)) score++;
if (_value.Any(c => !char.IsLetterOrDigit(c))) score++;
```

Left to you: whether `Strength` should be a property or a method. The rule of
thumb is that a property should be cheap and side-effect-free and should feel
like data; this one is O(n) over a short string, which is comfortably inside
"cheap". A property that hit a database would not be.
