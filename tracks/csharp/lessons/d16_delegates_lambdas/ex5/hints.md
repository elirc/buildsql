## Hint 1

`Comparison<T>` is a delegate: `(a, b) => int`, negative when `a` sorts first,
zero when they tie, positive when `b` sorts first. All three methods return one,
so all three bodies are `return (a, b) => ...;`.

`ByKey` should not compare the items at all - it compares what the key function
says about them.

## Hint 2

```csharp
public static Comparison<T> ByKey<T>(Func<T, int> key)
{
    return (a, b) => key(a).CompareTo(key(b));
}
```

For `Reversed`, resist `-inner(a, b)`. A comparison may legally return any
negative number, and `-int.MinValue` overflows straight back to `int.MinValue`,
so the negation reports "less than" for a pair that was greater. Swap the
operands instead.

`Then` needs to call `first` once, keep the answer in a local, and consult
`second` only when that answer was `0` - adding or multiplying the two results
gives orderings that are not even self-consistent.
