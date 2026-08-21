# 08 — Collections

You have been using `List<T>` since lesson 02 on the strength of "it is a
growable array", which is true and is about a fifth of what you need. This
lesson is the rest: which collection to reach for, what each one is fast at,
and what `IEnumerable<T>` — the type that keeps showing up in these signatures
— actually promises.

The choice matters more than beginners expect. Deduplicating a million strings
with `List.Contains` takes minutes; with a `HashSet` it takes a fraction of a
second, and the code is shorter. That is not micro-optimisation, it is picking
the data structure that matches the question you keep asking. "Is this in
there?" is a `HashSet`. "What is the value for this key?" is a `Dictionary`.
"Who is next?" is a `Queue`. "What was the most recent?" is a `Stack`.

The other half of the lesson is `yield`, which lets you write a sequence that
does not exist yet — computed one item at a time, as somebody reads it. That is
the machinery underneath every LINQ query you are about to write in lesson 10,
and meeting it here means LINQ will look like a library rather than magic.

## Concept — the family, and what each is for

```csharp
List<string> names = new List<string> { "ada", "bo" };
names.Add("cy");                 // append: fast
names[0];                        // by position: fast
names.Contains("bo");            // by value: walks the whole list

Dictionary<string, int> ages = new Dictionary<string, int> { ["ada"] = 36 };
ages["bo"] = 41;                 // add or overwrite
ages.TryGetValue("cy", out int a);   // safe lookup: false, and a is 0
// ages["cy"] would THROW KeyNotFoundException

HashSet<string> seen = new HashSet<string>();
seen.Add("ada");                 // returns true the first time, false after

Queue<string> line = new Queue<string>();
line.Enqueue("ada"); line.Dequeue();     // first in, first out

Stack<string> undo = new Stack<string>();
undo.Push("typed"); undo.Pop();          // last in, first out
```

`Dictionary` and `HashSet` are both hash tables, which is why lesson 06's
`GetHashCode` contract mattered: they hash the key to pick a bucket and only
compare within it.

**The interfaces above them** are what your method signatures should use:

```
IEnumerable<T>       you can foreach it. That is all.
  ICollection<T>     ...and it has Count, Add, Remove, Contains
    IList<T>         ...and items have positions: this[i], Insert, RemoveAt
IReadOnlyList<T>     positions, no mutation
IDictionary<K,V>     keyed access
```

The rule: **take the weakest type you can use, return the strongest you can
promise.** A method that only loops should take `IEnumerable<T>`, so callers
can pass an array, a list, or a lazy query without materialising anything.

**Iterators.** A method that returns `IEnumerable<T>` and contains `yield` is
compiled into a state machine:

```csharp
public static IEnumerable<int> Evens(IEnumerable<int> numbers)
{
    foreach (int n in numbers)
    {
        if (n % 2 == 0)
        {
            yield return n;      // hand one out, pause here
        }
    }
}
```

Two consequences that surprise people. Calling `Evens(...)` runs **none** of
that body — it hands back an object that will run it when enumerated. And each
`foreach` over the result runs the whole thing again from the start. Lesson 10
ex3 is where that second one bites.

## Exercise 1 — a dictionary and the key that isn't there

Edit `src/Lessons/L08_Collections/Ex1.cs`. `Words.Count(text)` returns how many
times each word appears, lower-cased, ignoring runs of spaces.
`Words.CountOf(counts, word)` returns a word's count, or `0` when it is absent.

Both bodies revolve around the same problem: indexing a `Dictionary` with a
missing key throws `KeyNotFoundException`. `TryGetValue` is the way round it,
and its `out` parameter comes back as `0` when the key was absent — which is
conveniently the count you wanted to start from.

```
uv run dojo test csharp 08_collections ex1
```

## Exercise 2 — a set

Edit `src/Lessons/L08_Collections/Ex2.cs`. `DistinctInOrder` returns each item
once, in the order first seen (case-sensitively — `"Cat"` and `"cat"` are two
items). `SharedCount` returns how many distinct items appear in both sequences.

`HashSet<T>.Add` returns `false` when the item was already there, which turns
"check, then add" into one line. A `HashSet` has no order, so keeping the
order is the `List`'s job.

```
uv run dojo test csharp 08_collections ex2
```

## Exercise 3 — a queue and a stack

Edit `src/Lessons/L08_Collections/Ex3.cs`. `Serve(queue, count)` takes up to
`count` items off the front, in service order, and serves nothing rather than
throwing when the queue runs dry. `IsBalanced(text)` checks that every
`( [ {` is closed by the right partner in the right order, ignoring all other
characters.

`IsBalanced` is a classic interview question and the reason is that it is the
smallest problem where a counter is *not enough*: `"(]"` has one opener and one
closer and is still wrong. A stack remembers not just how many are open but
which.

```
uv run dojo test csharp 08_collections ex3
```

## Exercise 4 — sequences that are computed as they are read

Edit `src/Lessons/L08_Collections/Ex4.cs`. Implement `Evens` and `WhileBelow`
as **iterators** — methods that use `yield return`, never building a list.

The gate can tell the difference. It hands you a source of 1,000 numbers that
counts how many were read, checks that calling your method read **zero** of
them, then takes three results and checks that far fewer than 1,000 were
touched. `WhileBelow` must stop at the first item that fails the test — `yield
break` — and never look at what follows.

```
uv run dojo test csharp 08_collections ex4
```

## Challenge — a collection of your own

Edit `src/Lessons/L08_Collections/Challenge.cs`. `RingBuffer<T>` keeps the most
recent `Capacity` items: adding to a full buffer drops the oldest. Implement
`Count`, `Add`, and `GetEnumerator()` so `foreach` and `string.Join` work on
it.

Honest difficulty note: the storage is a `List<T>` and the logic is three
lines; the new idea is that implementing `IEnumerable<T>` is what lets *other
people's code* — `foreach`, `string.Join`, every LINQ operator — work with your
type. The non-generic `IEnumerator IEnumerable.GetEnumerator()` at the bottom
is written for you, and it is lesson 05's explicit implementation in the wild.

```
uv run dojo test csharp 08_collections challenge
```

## Review

`review1` builds a `Dictionary<char, List<string>>` and answers lookups for
letters that may not be there. `dojo review` will bring it back.

## The gate

This is the entire gate class, `tests/Gates/L08_CollectionsTests.cs`:

```csharp
using System.Collections;

using CSharpDojo.L08_Collections;

namespace CSharpDojo.Gates;

public class L08_CollectionsTests
{
    [Fact]
    public void Ex1_WordCountsLiveInADictionary()
    {
        Dictionary<string, int> counts = Words.Count("the cat sat on THE mat");

        Teach.Equal(5, counts.Count,
            "Five distinct words: the, cat, sat, on, mat. \"THE\" is the same word as \"the\" "
                + "once you lower-case it - reread README ex1.");
        Teach.Equal(2, counts["the"],
            "\"the\" appears twice, in two different cases. Store the lower-cased key.");
        Teach.Equal(1, counts["mat"], "Every other word appears once.");

        Dictionary<string, int> spaced = Words.Count("a  b");
        Teach.Equal(2, spaced.Count,
            "A run of spaces must not produce an empty-string word - "
                + "StringSplitOptions.RemoveEmptyEntries, as in lesson 02.");

        Teach.Equal(2, Words.CountOf(counts, "the"), "A present key gives its count.");
        Teach.Equal(0, Words.CountOf(counts, "zebra"),
            "A missing key gives 0. counts[\"zebra\"] would throw KeyNotFoundException, so "
                + "reach for TryGetValue (or GetValueOrDefault) instead - reread README ex1.");
    }

    [Fact]
    public void Ex2_HashSetAnswersMembershipAndUniqueness()
    {
        List<string> distinct = Sets.DistinctInOrder(new[] { "b", "a", "b", "c", "a" });

        Teach.Equal("b, a, c", string.Join(", ", distinct),
            "Each item once, in the order it was FIRST seen - so \"b\" leads. A HashSet "
                + "remembers what you have seen; the List remembers the order - reread "
                + "README ex2.");

        Teach.Equal("Cat, cat", string.Join(", ", Sets.DistinctInOrder(new[] { "Cat", "cat", "Cat" })),
            "The default comparison is case-SENSITIVE, so \"Cat\" and \"cat\" are two items.");

        Teach.Equal(2, Sets.SharedCount(new[] { "a", "b", "c", "a" }, new[] { "b", "c", "z" }),
            "\"b\" and \"c\" appear in both. The duplicate \"a\" on the left changes nothing - "
                + "reread README ex2.");
        Teach.Equal(0, Sets.SharedCount(new[] { "a" }, Array.Empty<string>()),
            "Nothing is shared with an empty sequence.");
    }

    [Fact]
    public void Ex3_QueuesServeInOrderAndStacksUnwind()
    {
        Queue<string> queue = new Queue<string>(new[] { "ada", "bo", "cy", "di" });

        Teach.Equal("ada, bo", string.Join(", ", Lines.Serve(queue, 2)),
            "A Queue is first-in first-out: the two who arrived first are served first - "
                + "reread README ex3.");
        Teach.Equal(2, queue.Count,
            "Serving REMOVES from the queue - Dequeue, not Peek. Two of the four are left.");
        Teach.Equal("cy, di", string.Join(", ", Lines.Serve(queue, 10)),
            "Asking for more than there are serves everyone still waiting, without throwing.");
        Teach.Equal("", string.Join(", ", Lines.Serve(queue, 1)),
            "An empty queue serves nobody. Dequeue on an empty Queue throws, so guard it "
                + "(TryDequeue, or check Count) - reread README ex3.");

        Teach.True(Lines.IsBalanced("a(b[c]{d})e"), "Every bracket is closed by its partner.");
        Teach.True(Lines.IsBalanced(""), "Nothing to close.");
        Teach.True(!Lines.IsBalanced("(]"), "Right count, wrong partner - the Stack tells you "
            + "WHICH bracket is still open, which counting alone cannot - reread README ex3.");
        Teach.True(!Lines.IsBalanced("(()"), "One opener never closed: the stack is not empty "
            + "at the end.");
        Teach.True(!Lines.IsBalanced("())"), "A closer with nothing open before it.");
    }

    private sealed class CountingSource : IEnumerable<int>
    {
        private readonly int _limit;

        public CountingSource(int limit) => _limit = limit;

        public int Pulled { get; private set; }

        public IEnumerator<int> GetEnumerator()
        {
            for (int i = 1; i <= _limit; i++)
            {
                Pulled++;
                yield return i;
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }

    [Fact]
    public void Ex4_IteratorsProduceItemsOnlyWhenAsked()
    {
        CountingSource source = new CountingSource(1000);
        IEnumerable<int> evens = Iterators.Evens(source);

        Teach.Equal(0, source.Pulled,
            "Calling Evens must not read a single item yet. An iterator method's body does not "
                + "run until somebody enumerates the result - if this is not 0 you built a "
                + "List instead of using yield return - reread README ex4.");

        Teach.Equal("2, 4, 6", string.Join(", ", evens.Take(3)),
            "The first three even numbers of 1..1000.");

        Teach.True(source.Pulled <= 20,
            $"Taking 3 items should have pulled about 6 from the source, not all 1000. It "
                + $"pulled {source.Pulled}. Laziness is the whole point of yield return - "
                + "reread README ex4.");

        Teach.Equal("1, 2, 3", string.Join(", ", Iterators.WhileBelow(new[] { 1, 2, 3, 9, 4 }, 5)),
            "Stop at the FIRST item that is not below the limit - the 4 after the 9 is never "
                + "reached. `yield break` ends the sequence - reread README ex4.");

        Teach.Equal("", string.Join(", ", Iterators.WhileBelow(new[] { 9, 1 }, 5)),
            "The very first item fails the test, so the sequence is empty.");
    }

    [Fact]
    public void Challenge_RingBufferKeepsTheLastFew()
    {
        RingBuffer<string> buffer = new RingBuffer<string>(3);
        buffer.Add("a");
        buffer.Add("b");

        Teach.Equal(2, buffer.Count, "Two in, two held - reread README challenge.");
        Teach.Equal("a, b", string.Join(", ", buffer),
            "string.Join foreaches your buffer, which works because it implements "
                + "IEnumerable<T>. Oldest first.");

        buffer.Add("c");
        buffer.Add("d");
        buffer.Add("e");

        Teach.Equal(3, buffer.Count,
            "A capacity of 3 never holds more than 3, however many are added - reread README "
                + "challenge.");
        Teach.Equal("c, d, e", string.Join(", ", buffer),
            "The oldest two were dropped as the newest arrived.");

        List<string> visited = new List<string>();
        foreach (string item in buffer)
        {
            visited.Add(item);
        }

        Teach.Equal("c, d, e", string.Join(", ", visited),
            "A plain foreach over your type works because the compiler found GetEnumerator.");

        Teach.Throws<ArgumentOutOfRangeException>(() => new RingBuffer<int>(0),
            "A buffer with no room is not a buffer - the constructor guard is written for you, "
                + "so this one should already pass.");
    }

    [Fact]
    public void Review1_ADictionaryOfListsNeedsTheMissingKeyHandled()
    {
        Dictionary<char, List<string>> groups = Grouping.ByFirstLetter(
            new[] { "apple", "avocado", "banana", "cherry", "apricot" });

        Teach.Equal(3, groups.Count, "Three distinct first letters: a, b, c.");
        Teach.Equal("apple, avocado, apricot", string.Join(", ", groups['a']),
            "The 'a' group holds three words, in arrival order - reread README review.");

        Teach.Equal("banana", string.Join(", ", Grouping.For(groups, 'b')),
            "A present letter gives its group.");
        Teach.Equal(0, Grouping.For(groups, 'z').Count,
            "A missing letter gives an EMPTY list, not null and not an exception - so the "
                + "caller can foreach the result without checking - reread README review.");

        Teach.Equal(0, Grouping.ByFirstLetter(Array.Empty<string>()).Count,
            "No words, no groups.");
    }
}
```

In plain English: `Ex1` counts a sentence with a repeated word in two cases,
checks the runs-of-spaces case, and asks for a word that isn't there. `Ex2`
checks first-seen ordering, case sensitivity, and an intersection with a
duplicate on one side. `Ex3` serves a queue in three goes including past the
end, then runs five bracket strings. `Ex4` uses a counting source to prove your
iterators are lazy. `Challenge` fills a ring buffer past its capacity and
enumerates it twice, and `Review1` is the spaced-repetition variant.

## The teaching point

Two habits come out of this lesson and both show up in code review.

The first is choosing the collection by the question. If you find yourself
writing `list.Contains(x)` inside a loop over another list, you have written an
n² algorithm by accident, and a `HashSet` fixes it with one line. If you find
yourself scanning a list to find the item with a given id, you wanted a
`Dictionary`. The .NET collection you pick is a claim about which operation you
will do a lot of.

The second is the signature habit: **accept `IEnumerable<T>`, return something
concrete**. A method demanding `List<T>` forces every caller with an array or a
query to copy. And when you return `IEnumerable<T>` from your own code, be
aware you are handing back a promise rather than data — the caller may enumerate
it twice, or never, and if it is backed by a database cursor or a file that
matters enormously. Lesson 10 ex3 makes exactly that mistake on purpose.

Next: **09_delegates_events_lambdas**, where methods themselves become values
you can pass around.
