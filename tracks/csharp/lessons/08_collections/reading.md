# Reading - csharp/08_collections

## Notes

**What each collection actually costs.** `List<T>` is an array that doubles
when it fills: indexing and appending are O(1) (appending *amortised* — the
occasional resize copies everything), inserting or removing in the middle is
O(n) because everything after it shifts, and `Contains` is O(n).
`Dictionary<TKey, TValue>` and `HashSet<T>` are hash tables: lookup, insert and
remove are O(1) on average and O(n) in the worst case, when every key hashes to
the same bucket. `Queue<T>` and `Stack<T>` are arrays with clever indices —
O(1) at their respective ends. Knowing this table is the difference between
code that scales and code that works on your laptop's test data.

**The hidden cost of the wrong one.** The classic accident is a `List.Contains`
inside a loop over another list: 10,000 × 10,000 comparisons for something a
`HashSet` does in 10,000. The second classic is `list.Insert(0, item)` in a
loop, which shifts the entire array every time — that is what `Queue<T>` and
`LinkedList<T>` exist for.

**`IEnumerable<T>` is a promise, not data.** It says only "you can ask me for
an enumerator". The thing behind it might be a list already in memory, a file
being read line by line, a database query that has not run yet, or an infinite
generator. That is why enumerating one twice is a smell — it might do the
expensive thing twice — and why `ToList()` exists: to say "I want this
materialised now, once".

**Iterators are state machines.** The compiler rewrites a method containing
`yield` into a class with a `MoveNext` and a `Current`, with your locals
promoted to fields and a state number tracking which `yield` you paused at.
That is why the body does not run when you call it (you got the state machine
back, not a result) and why every enumeration starts over (each `foreach` asks
for a fresh one). You can see the generated class in any decompiler, and it is
worth doing once.

**The `Try...` pattern, everywhere.** `TryGetValue`, `TryDequeue`, `TryPop`,
`TryPeek`, `TryAdd`. Every one exists because the alternative — an exception on
an ordinary outcome — is both slow and wrong-shaped. Lesson 02 introduced the
idea; the collections are where you will use it every day.

## ex1

`TryGetValue(key, out int soFar)` writing 0 into the out parameter when the key
is missing is not an accident you are exploiting — it is `default(TValue)`,
documented, and the reason counting dictionaries read so cleanly. The
alternatives are `ContainsKey` followed by an index (two lookups where one
would do) and `GetValueOrDefault` (one lookup, added in .NET Core 2.0, and the
shortest correct answer for `CountOf`).

The indexer's asymmetry is worth memorising because it catches everyone once:
**reading** a missing key throws, **writing** a missing key adds it. So
`counts[key] = counts[key] + 1` throws on the first occurrence, while
`counts[key] = soFar + 1` is fine. `Add` is stricter still — it throws if the
key is already present, which is the right choice when a duplicate means a bug.

`StringComparer.OrdinalIgnoreCase` passed to the dictionary constructor is how
you would really do case-insensitive keys, and it is worth knowing why the
comparer belongs to the *dictionary* rather than to each lookup: the hash code
has to be computed the same way for storing and for finding, so both sides must
agree on what "equal" means. It is lesson 06's contract again, parameterised.

## ex2

`HashSet<T>.Add` returning a `bool` is the API design worth stealing: a method
that both performs an action and reports what it found saves the caller a
second lookup and, more importantly, removes the race between checking and
acting. `Dictionary.TryAdd` does the same.

The set operations — `UnionWith`, `IntersectWith`, `ExceptWith`,
`SymmetricExceptWith`, `IsSubsetOf`, `Overlaps` — mutate in place and are the
fast paths. LINQ has non-mutating equivalents (`Union`, `Intersect`, `Except`)
that return new sequences, which is usually what you want when the input is not
yours to modify. The SQL parallel is exact: these are `UNION`, `INTERSECT` and
`EXCEPT`, and the SQL course's lesson 11 is the same ideas over rows.

Order is the thing a `HashSet` does not give you. It has *an* order when you
enumerate it — the bucket order — but it is unspecified, can change when the
set grows, and must never be relied on. When you need both uniqueness and
order, you need both structures, which is exactly what the exercise made you
write.

## ex3

The queue and the stack are the two ends of the same idea, and the reason both
exist is that "next" means different things. A print queue, a message queue, a
breadth-first search: first in, first out. An undo history, a call stack, a
depth-first search, and bracket matching: last in, first out.

`IsBalanced` is the canonical stack interview question because a counter looks
like it should work and does not. `"([)]"` has matching counts of each kind and
is still wrong, because the *nesting* is wrong, and nesting is precisely what a
stack records. When you see a problem where "the most recent unfinished thing"
matters — parsing, tree traversal, expression evaluation — reach for a stack
before you reach for recursion, because recursion is the same stack with less
control.

`TryDequeue` over `Dequeue` matters here for the reason lesson 02 gave: an
empty queue is an ordinary state, not an exceptional one. Serving fewer people
than asked for is a normal Tuesday.

## ex4

This is the most important exercise in the lesson, because everything in lesson
10 rests on it. Three facts:

1. **The body does not run when you call the method.** You get a state machine
   back. Any argument validation you wanted to do eagerly therefore does not
   happen until enumeration — which is why the framework's own iterator methods
   are usually split into a public method that validates and a private iterator
   it returns.
2. **Enumeration is pull-based.** The consumer asks for one item; your code
   runs until the next `yield return`; then it pauses again. `Take(3)` simply
   stops asking, so your loop never runs a fourth time. That is how an infinite
   sequence can be useful.
3. **Each enumeration starts from scratch.** A second `foreach` calls
   `GetEnumerator` again and reruns your whole method.

The gate's counting source measures all three. If you build a `List` and return
it, everything is computed up front — the values are identical and the
behaviour is completely different, which is exactly the sort of bug that only
shows up when the input gets large or expensive.

`yield break` versus `continue` is the other check. `TakeWhile` semantics
("stop at the first failure") and `Where` semantics ("skip the failures") look
similar on the sample data and diverge on `{ 1, 2, 3, 9, 4 }`. Knowing which
one you meant is what makes the LINQ operator names worth learning precisely.

## challenge

Implementing `IEnumerable<T>` is how your type joins the ecosystem: `foreach`,
`string.Join`, every LINQ operator, collection initialisers and pattern
matching over sequences all key off it. That is lesson 05's point — implement
the contract the framework already understands — applied to the most useful
contract in the library.

The two-interface arrangement (`IEnumerable<T>` deriving from the old
non-generic `IEnumerable`) is a piece of history: the generic one arrived in
2005 and had to remain compatible with 2002-era code. Explicit implementation
is how everybody hides the old one, and now you have written that idiom
yourself.

Worth knowing: `foreach` does not actually require the interface. The compiler
looks for a public `GetEnumerator()` method with the right shape — a rare bit
of duck typing in a nominal language — which is what allows `foreach` over
`Span<T>` without any interface at all. Implement the interface anyway; LINQ
and everything else do require it.

The `RemoveAt(0)` in `Add` is O(n) and a real ring buffer would keep a fixed
array with head and tail indices, overwriting in place. Writing that version is
a good hour's work and a genuinely common interview task.

## review1

`Dictionary<char, List<string>>` is the shape you build by hand about twice
before you discover LINQ's `GroupBy` (lesson 11), and doing it by hand first is
what makes `GroupBy` legible when you meet it. The awkward moment — no list yet
for a new key — is the same TryGetValue-shaped hole as ex1, and the same
`Dictionary.TryAdd` / `CollectionsMarshal.GetValueRefOrAddDefault` tricks apply
if you go looking.

Adding the empty list to the dictionary *before* filling it works because the
dictionary stores a reference. If `List<T>` were a struct, that code would
silently drop every word — which is precisely the mutable-struct trap from
lesson 06, and a good reminder that "value or reference?" is a question with
practical consequences every day.

Returning an empty list rather than null from `For` is the *null object
pattern*: give callers something harmless to work with instead of something
they must check. `Enumerable.Empty<T>()` and `Array.Empty<T>()` exist for this
and allocate nothing, because they hand back a cached singleton — safe only
because both are immutable, which is why an empty `List<T>` singleton would be
a bug waiting to happen.

## Further reading

- [Collections and data structures](https://learn.microsoft.com/en-us/dotnet/standard/collections/) — the overview, with the complexity table for each type.
- [`Dictionary<TKey,TValue>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2) — including the indexer's add-or-overwrite behaviour and the comparer constructor.
- [`HashSet<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1) — set operations and what `Add`'s return value means.
- [Iterators](https://learn.microsoft.com/en-us/dotnet/csharp/iterators) — `yield return`, `yield break`, and what the compiler generates.
- [`IEnumerable<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.ienumerable-1) — the contract every sequence in .NET implements.
- [When to use generic collections](https://learn.microsoft.com/en-us/dotnet/standard/collections/when-to-use-generic-collections) — the "which one should I pick" page, worth a skim before every design.
