## Hint 1

A generic method declares its type parameter after the name -
`Repeat<T>(T item, int count)` - and then treats `T` as an ordinary type it
knows nothing about. That is the point: with no constraint you may store a `T`,
pass it around and compare it with `null`, and nothing else.

Neither method here needs to know anything about `T`.

## Hint 2

`Repeat` is a `for` loop adding `item` to a `List<T>`. A count of 0 or less
needs no guard - the loop condition is already false.

`Interleave` needs two enumerators advanced in step:

```csharp
using IEnumerator<T> left = a.GetEnumerator();
using IEnumerator<T> right = b.GetEnumerator();
bool hasLeft = left.MoveNext();
bool hasRight = right.MoveNext();
while (hasLeft || hasRight) { ... }
```

Take from each side when it still has something, then advance that side. The
`using` matters: `IEnumerator<T>` is `IDisposable`, and a `foreach` would
normally dispose it for you.

Left to you: two indexed loops over `ToList()` copies would also work and is
easier to read. It costs an allocation and it will not work on an infinite
sequence. Know which trade you made.
