## Hint 1

Write the four methods exactly as their doc comments describe - do not try to
make them all agree. Two of them will disagree, and that is the exercise.

Before you run the gate, predict each answer, then check. The one worth
thinking hardest about is `ViaCopyThenReadOriginal`.

## Hint 2

The rule underneath all four: **assigning a struct anywhere makes a copy**, and
assigning one to an interface-typed variable copies it into a box on the heap.

- `ViaLocal` - one variable throughout: 2.
- `ViaInterface` - `new MutableCounter()` is boxed once, and every call goes to
  that single box: 2.
- `ViaCopyThenReadOriginal` - the local is copied into a box; both increments
  land on the box; the local is still 0.
- `ViaArrayElement` - an array element *is* a variable, so the call mutates it
  in place: 1.

The last one has a twin worth knowing: `list[0].Increment()` on a `List<T>` of
structs does not compile at all, because the indexer returns a copy and C#
refuses to let you mutate a value that is about to be thrown away. The array
version compiles because array indexing produces a variable reference.

This is why the guidance is "make structs immutable". Not because mutation is
slow, but because you cannot see, at the call site, which copy you are talking
to.
