## Hint 1

Every struct has a parameterless "constructor" you cannot remove and cannot
intercept: `default(T)` zeroes the memory. Reference fields become null, numbers
become 0, bools become false - and none of your validation runs.

So a struct wrapping a `string` has a state that its own constructor would
reject, and it is reachable with `default`, with `new T[n]`, and with an
uninitialised field of that type.

## Hint 2

The constructor is ordinary validation:

```csharp
if (code is null || code.Length != 3 || !code.All(char.IsAsciiLetter))
    throw new ArgumentException("A currency code is three letters.", nameof(code));
Code = code.ToUpperInvariant();
```

`IsDefault` is `Code is null` and `Safe` is `Code ?? "???"`. Both exist because
the hole cannot be closed - only detected and handled.

That is the real lesson, and it is the standard argument against
"parse, don't validate" types being structs: a `readonly record struct
EmailAddress(string Value)` looks watertight and still has
`default(EmailAddress).Value == null` waiting in it. The usual answers are to
use a class, to make the zero value meaningful, or to expose a reader that
copes - never to assume the constructor ran.
