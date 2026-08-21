## Hint 1

Three members to write, and one of them is what makes `foreach` work on your
own type.

Keep the storage boring: a `List<T>` field is already declared. The buffer's
behaviour is entirely in `Add` — append, and if that made it too long, drop the
oldest.

## Hint 2

`Count` is the list's count. `Add` is two lines: add, then trim if over
capacity (`_items.RemoveAt(0)` drops the oldest).

`GetEnumerator` can be an iterator, exactly like ex4:

```csharp
public IEnumerator<T> GetEnumerator()
{
    foreach (T item in _items)
    {
        yield return item;
    }
}
```

The compiler turns that into a state machine implementing `IEnumerator<T>` for
you — which is a lot of code you are not writing.

## Hint 3

Two things worth understanding rather than copying.

First, `foreach` does not actually require `IEnumerable<T>`: the compiler looks
for a public `GetEnumerator()` method by name (duck typing, uniquely in this
one place). Implementing the interface is still right, because that is what
LINQ and `string.Join` demand.

Second, the explicit `IEnumerator IEnumerable.GetEnumerator()` at the bottom is
written for you, and it is lesson 05's explicit implementation earning its
keep: the old non-generic interface is required, and hiding it behind an
explicit implementation keeps it off your type's public surface.

Left to you: the real ring buffer keeps a fixed array and two indices, so
nothing is ever shifted. `RemoveAt(0)` is O(n). Worth doing once the gate is
green if you want the version that would survive a code review.
