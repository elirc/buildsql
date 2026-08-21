## Hint 1

Two decisions: how to walk the numbers downward, and how to glue the pieces
together with commas. Solve them separately — collect the pieces first, join
them second.

The `Countdown(0)` case is the one that decides your design. If you build the
string by appending `"5, "` as you go, you have to remember to trim the last
separator, and the empty case has nothing to trim.

## Hint 2

A `for` loop can count down as easily as up: the initialiser, the condition and
the step are three independent expressions.

```csharp
for (int n = from; n >= 1; n--)
```

Collect into a `List<string>` with `.Add(...)`, then `string.Join(", ", parts)`
puts the separator *between* the pieces and nowhere else — which is exactly why
the empty case then costs you nothing.

## Hint 3

Add `"liftoff"` to the same list, after the loop, and join once at the end. An
`int` needs to become text before it can go into a `List<string>`:
`n.ToString()` or `$"{n}"`.

If you would rather use a `StringBuilder` or plain concatenation, that is fine
too — but then re-check `Countdown(0)` yourself before you run the gate.
