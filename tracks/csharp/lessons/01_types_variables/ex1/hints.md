## Hint 1

Both bodies are the same three statements. Write them once and paste them into
the other method — the point of the exercise is that identical code gives two
different answers, and you should see that with your own eyes rather than
reason your way to it.

The three statements are: declare a local that holds a copy of the parameter,
write 99 into that local, return the parameter's field.

## Hint 2

Declaring the local is `SomeType copy = original;`. You can use `var` if you
prefer; the type is whatever the parameter's type is.

Do not call anything on `original` other than reading `.Degrees` at the end,
and do not touch `original.Degrees` before the return. If you find yourself
writing an `if`, or returning a literal, stop — the whole exercise is that you
do the same thing twice and let the language answer.

## Hint 3

```csharp
public static int AfterCopyingAStruct(ReadingValue original)
{
    ReadingValue copy = original;
    // set the copy's Degrees to 99
    return original.Degrees;
}
```

The class version is that, with `ReadingRef` in both places. Fill in the
middle line for each and run the gate before you predict the answers; then
read `reading.md` for why the two differ.
