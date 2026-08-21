## Hint 1

Three tiny methods, each one three lines, each one a different container for the
same struct. Write them exactly as described — the differences between them are
the whole exercise.

If you find yourself wanting to change `Pixel` to a class, stop: that is the
comparison, not the fix.

## Hint 2

The array version is literally `pixels[0].Brightness = 9;` and it compiles.

The list version is not — `pixels[0].Brightness = 9;` is a compiler error — so
it is copy, modify, write back:

```csharp
Pixel copy = pixels[0];
copy.Brightness = 9;
pixels[0] = copy;
```

`Bump` sets `pixel.Brightness = 9` and returns it.

## Hint 3

The one-sentence answer, ready to say: **a struct is copied whenever it is
assigned, passed or read out of a `List<T>` — but array indexing gives a real
reference into the array's storage, so it is not copied there.**

That is why the array version works, the list version needs the write-back, and
the parameter version cannot touch the caller's value at all.

Left to you: work out what `List<T>`'s indexer would have to return for the
direct assignment to work. (A `ref` return — which `CollectionsMarshal.AsSpan`
can actually give you. Knowing that exists is a nice extra.)
