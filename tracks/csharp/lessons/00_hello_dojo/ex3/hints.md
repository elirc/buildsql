## Hint 1

Two steps, in this order: cut the slug into pieces, then turn the piece you
want into a number.

Note that `"13_async_await"` has two underscores. "Everything before the last
underscore" is the wrong rule and will bite you on that input; "the first
piece" is the right one.

## Hint 2

`string` has a `Split` method that takes a separator and hands back a
`string[]`. Arrays are indexed from zero, so the first piece is at `[0]`.

For the conversion, `int.Parse(text)` is the direct route. (There is also
`int.TryParse`, which returns a `bool` instead of throwing — the reading
explains when each one is right. For this exercise the input is always
well-formed, so the simple one is the honest choice.)

Predict the answer for `"00_hello_dojo"` before you run the gate.

## Hint 3

The shape is:

```csharp
return int.Parse(slug.Split(/* what separator? */)[0]);
```

One decision left for you: the separator. It is a single character, so use a
`char` literal in single quotes (`'x'`) rather than a `string` in double
quotes — both overloads exist, but the `char` one is the one to reach for.

If the compiler complains that it "cannot implicitly convert type 'string' to
'int'", you have written the split but not the parse. That error is the
declared return type doing its job.
