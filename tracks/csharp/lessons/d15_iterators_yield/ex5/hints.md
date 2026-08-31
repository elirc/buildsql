## Hint 1

A method containing `yield` postpones its ENTIRE body - including your
`throw`. So the public method must contain NO yield: it validates n, then
returns the result of a second, private method that does contain the yield.
Calling the private iterator is instant; the check already ran.

## Hint 2

```csharp
public static IEnumerable<T> EveryNth<T>(IEnumerable<T> items, int n)
{
    if (n < 1) { throw new ArgumentOutOfRangeException(nameof(n), n, "..."); }
    return Iterator(items, n);
}

private static IEnumerable<T> Iterator<T>(IEnumerable<T> items, int n) { ... }
```

Inside the iterator, count positions and yield when `position % n == 0`.
