# d21 - Deferred execution drills

Eight problems on the fact that a LINQ query is a recipe, not an answer: when
it runs, how often it runs, what it captured, and what happens when the thing
it reads can only be read once. They drill lesson 10 - reread `10_linq_1`, and
its "the query is not the answer" exercise in particular, if `ToList` still
looks like noise.

Every file lives in `src/Lessons/D21_DeferredExecution/`. Nothing here depends
on anything else here.

## Exercise 1 - a query is not an answer

`Deferred.BigOnes(numbers, min)` returns the query itself, so a later change to
the list is visible the next time it is enumerated.
`Deferred.BigOnesNow(numbers, min)` returns the answer, taken now. The gate
mutates the list between the two enumerations.

Edit `src/Lessons/D21_DeferredExecution/Ex1.cs`.

```
uv run dojo test csharp d21_deferred_execution ex1
```

## Exercise 2 - two questions, one pass

`Passes.CountAndTotalTwice` is written for you and walks the sequence twice.
`Passes.CountAndTotal(numbers, predicate)` returns the same
`(Count, Total)` while enumerating the source exactly once and calling the
predicate exactly once per item. The gate counts both.

Edit `src/Lessons/D21_DeferredExecution/Ex2.cs`.

```
uv run dojo test csharp d21_deferred_execution ex2
```

## Exercise 3 - what the lambda captured

`Captures.Above(numbers, threshold)` returns a query that reads
`threshold.Value` afresh every time it runs.
`Captures.AboveFixed(numbers, threshold)` returns a query whose threshold was
fixed at the moment the method was called. The gate changes the object in
between.

Edit `src/Lessons/D21_DeferredExecution/Ex3.cs`.

```
uv run dojo test csharp d21_deferred_execution ex3
```

## Exercise 4 - a sequence you may only read once

`Safety.Inspect(source)` returns `(Count, First, Last)` from a source that
throws on a second enumeration, and throws `InvalidOperationException` when the
source is empty.

Edit `src/Lessons/D21_DeferredExecution/Ex4.cs`.

```
uv run dojo test csharp d21_deferred_execution ex4
```

## Exercise 5 - which operators can stop early

`Streaming.FirstMatching(numbers, predicate, count)` returns the first `count`
matches and must not read the source past the last item it needed.
`Streaming.LargestMatching(numbers, predicate, count)` returns the `count`
largest matches, descending - and cannot avoid reading everything. The gate
counts the reads for both.

Edit `src/Lessons/D21_DeferredExecution/Ex5.cs`.

```
uv run dojo test csharp d21_deferred_execution ex5
```

## Exercise 6 - an expensive selector, called once per item

`Costs.CheapestTwoPass` is written for you and calls the cost function more
than once per item. `Costs.Cheapest(items, cost)` returns the item with the
lowest cost - the first of any tie - calling `cost` exactly once per item and
enumerating the source once. It throws `InvalidOperationException` when there
are no items.

Edit `src/Lessons/D21_DeferredExecution/Ex6.cs`.

```
uv run dojo test csharp d21_deferred_execution ex6
```

## Exercise 7 - read once, replay for ever

`Memoized<T>` wraps a sequence so the source is enumerated at most once however
often the wrapper is enumerated, while staying lazy: building it reads nothing,
and asking for two items reads two. `Cached` reports how many items have been
pulled so far. Two enumerators running at the same time share the cache.

Edit `src/Lessons/D21_DeferredExecution/Ex7.cs`.

```
uv run dojo test csharp d21_deferred_execution ex7
```

## Exercise 8 - three answers, one reading

`OnePass.Analyse(lines)` reads the lines exactly once and returns a
`LineReport` holding how many there were, the longest line (the first of any
tie), and every distinct whitespace-separated word in first-seen order. It
throws `InvalidOperationException` when there are no lines. The gate hands it a
source that permits one enumeration.

Edit `src/Lessons/D21_DeferredExecution/Ex8.cs`.

```
uv run dojo test csharp d21_deferred_execution ex8
```

## The gate

This is the entire gate class, `tests/Gates/D21_DeferredExecutionTests.cs`:

```csharp
using System.Collections;

using CSharpDojo.D21_DeferredExecution;

namespace CSharpDojo.Gates;

public class D21_DeferredExecutionTests
{
    // A source that records how often it is enumerated and how many items are
    // pulled out of it.
    private sealed class Counting<T> : IEnumerable<T>
    {
        private readonly T[] _items;

        public Counting(params T[] items)
        {
            _items = items;
        }

        public int Reads { get; private set; }

        public int Enumerations { get; private set; }

        public IEnumerator<T> GetEnumerator()
        {
            Enumerations++;
            return Walk().GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        private IEnumerable<T> Walk()
        {
            foreach (T item in _items)
            {
                Reads++;
                yield return item;
            }
        }
    }

    // A source that refuses a second enumeration, like a network reader.
    private sealed class OneShot<T> : IEnumerable<T>
    {
        private readonly T[] _items;
        private bool _used;

        public OneShot(params T[] items)
        {
            _items = items;
        }

        public IEnumerator<T> GetEnumerator()
        {
            if (_used)
            {
                throw new InvalidOperationException("this sequence can only be enumerated once");
            }

            _used = true;
            return ((IEnumerable<T>)_items).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

    [Fact]
    public void Ex1_AQueryIsNotAnAnswer()
    {
        List<int> numbers = new List<int> { 1, 5, 9 };

        IEnumerable<int> query = Deferred.BigOnes(numbers, 5);
        List<int> snapshot = Deferred.BigOnesNow(numbers, 5);

        Teach.Equal("5|9", string.Join("|", query), "Both agree to begin with...");
        Teach.Equal("5|9", string.Join("|", snapshot), "...as they should.");

        numbers.Add(7);

        Teach.Equal("5|9|7", string.Join("|", query),
            "The query kept a reference to the LIST, not to its contents, and ran again from "
                + "scratch when it was enumerated a second time - so the new 7 is in the answer. "
                + "If this still says 5|9 you returned a materialised result - reread README ex1.");
        Teach.Equal("5|9", string.Join("|", snapshot),
            "The snapshot ran once, when it was built, and cannot see anything that happened "
                + "afterwards - reread README ex1.");

        numbers.Clear();

        Teach.Equal(0, query.Count(),
            "An emptied list makes the query empty too, however many times it worked before - "
                + "reread README ex1.");
        Teach.Equal(2, snapshot.Count,
            "...and leaves the snapshot exactly where it was. That difference is the whole "
                + "lesson - reread README ex1.");
    }

    [Fact]
    public void Ex2_TwoQuestionsOnePass()
    {
        Counting<int> twiceSource = new Counting<int>(1, 2, 3, 4, 5);
        int predicateCalls = 0;
        Func<int, bool> even = number =>
        {
            predicateCalls++;
            return number % 2 == 0;
        };

        (int Count, int Total) twice = Passes.CountAndTotalTwice(twiceSource, even);
        Teach.Equal(2, twice.Count, "Two even numbers...");
        Teach.Equal(6, twice.Total, "...adding up to 6.");
        Teach.Equal(10, twiceSource.Reads,
            "The supplied version reads all five items TWICE, because each LINQ call starts the "
                + "sequence again from the beginning - reread README ex2.");
        Teach.Equal(10, predicateCalls, "...and runs the predicate twice per item as well.");

        Counting<int> onceSource = new Counting<int>(1, 2, 3, 4, 5);
        predicateCalls = 0;
        (int Count, int Total) once = Passes.CountAndTotal(onceSource, even);

        Teach.Equal(2, once.Count, "The same two...");
        Teach.Equal(6, once.Total, "...and the same six.");
        Teach.Equal(5, onceSource.Reads,
            "...for five reads instead of ten. Both answers have to be accumulated in the same "
                + "walk - reread README ex2.");
        Teach.Equal(5, predicateCalls,
            "...and the predicate runs exactly once per item, which matters when it is expensive "
                + "or has a side effect - reread README ex2.");
        Teach.Equal(1, onceSource.Enumerations,
            "GetEnumerator was called on the source exactly once - reread README ex2.");

        (int Count, int Total) nothing = Passes.CountAndTotal(Array.Empty<int>(), even);
        Teach.Equal(0, nothing.Count, "An empty sequence counts zero...");
        Teach.Equal(0, nothing.Total, "...and totals zero, without throwing.");
    }

    [Fact]
    public void Ex3_WhatTheLambdaCaptured()
    {
        int[] numbers = { 1, 5, 9 };
        Threshold threshold = new Threshold { Value = 4 };

        IEnumerable<int> live = Captures.Above(numbers, threshold);
        IEnumerable<int> settled = Captures.AboveFixed(numbers, threshold);

        Teach.Equal("5|9", string.Join("|", live), "Both agree at first...");
        Teach.Equal("5|9", string.Join("|", settled), "...naturally.");

        threshold.Value = 8;

        Teach.Equal("9", string.Join("|", live),
            "The lambda captured the OBJECT and reads its Value each time it runs, so raising the "
                + "threshold changed a query that was written before the change - reread "
                + "README ex3.");
        Teach.Equal("5|9", string.Join("|", settled),
            "Copying Value into a local before building the query is what freezes it: the lambda "
                + "then captures the local, which nobody else can reach - reread README ex3.");

        threshold.Value = 100;
        Teach.Equal(0, live.Count(), "The live query keeps following...");
        Teach.Equal(2, settled.Count(), "...and the settled one never will.");
    }

    [Fact]
    public void Ex4_ASequenceYouMayOnlyReadOnce()
    {
        (int Count, int First, int Last) result = Safety.Inspect(new OneShot<int>(3, 1, 4));
        Teach.Equal(3, result.Count,
            "Three answers from a source that allows exactly one enumeration, so the items have "
                + "to be kept as you go - Count(), First() and Last() would each start the "
                + "sequence again and the second one would throw - reread README ex4.");
        Teach.Equal(3, result.First, "The first item.");
        Teach.Equal(4, result.Last, "The last one.");

        Teach.Equal(7, Safety.Inspect(new OneShot<int>(7)).First, "One item is both first...");
        Teach.Equal(7, Safety.Inspect(new OneShot<int>(7)).Last, "...and last.");

        Teach.Throws<InvalidOperationException>(() => Safety.Inspect(new OneShot<int>()),
            "There is no first item of nothing - reread README ex4.");

        Counting<int> counted = new Counting<int>(1, 2, 3);
        Safety.Inspect(counted);
        Teach.Equal(1, counted.Enumerations,
            "One enumeration, no more - reread README ex4.");
        Teach.Equal(3, counted.Reads, "...and each item read exactly once.");

        OneShot<int> spent = new OneShot<int>(1, 2);
        Safety.Inspect(spent);
        Teach.Throws<InvalidOperationException>(
            () =>
            {
                foreach (int ignored in spent)
                {
                }
            },
            "...and the source really does refuse a second reading, which is what makes this "
                + "exercise more than a style preference - reread README ex4.");
    }

    [Fact]
    public void Ex5_WhichOperatorsCanStopEarly()
    {
        Counting<int> early = new Counting<int>(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        Teach.Equal("2|4", string.Join("|", Streaming.FirstMatching(early, n => n % 2 == 0, 2)),
            "The first two even numbers - reread README ex5.");
        Teach.Equal(4, early.Reads,
            "Only four items were read. Where and Take both stream, so the pipeline stops the "
                + "moment Take has what it wanted - putting a ToList in the middle would have "
                + "read all ten - reread README ex5.");

        Counting<int> everything = new Counting<int>(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        Teach.Equal("10|8", string.Join("|", Streaming.LargestMatching(everything, n => n % 2 == 0, 2)),
            "The two largest even numbers, descending - reread README ex5.");
        Teach.Equal(10, everything.Reads,
            "This one has to read all ten, and no cleverness can avoid it: OrderByDescending "
                + "cannot know which item is largest until it has seen the last one. That is what "
                + "a buffering operator means - reread README ex5.");

        Counting<int> untouched = new Counting<int>(1, 2, 3);
        Teach.Equal(0, Streaming.FirstMatching(untouched, n => true, 0).Count, "Asking for none...");
        Teach.Equal(0, untouched.Reads,
            "...reads nothing at all: Take(0) never asks the source for a first item - reread "
                + "README ex5.");

        Counting<int> few = new Counting<int>(1, 3, 5);
        Teach.Equal(0, Streaming.FirstMatching(few, n => n % 2 == 0, 2).Count,
            "No matches at all is an empty list, not an error...");
        Teach.Equal(3, few.Reads, "...and finding that out did cost a full pass.");
    }

    [Fact]
    public void Ex6_AnExpensiveSelectorCalledOncePerItem()
    {
        string[] items = { "alpha", "be", "gamma", "de" };
        int calls = 0;
        Func<string, int> cost = item =>
        {
            calls++;
            return item.Length;
        };

        Teach.Equal("be", Costs.CheapestTwoPass(items, cost), "The supplied version finds it...");
        Teach.True(calls > items.Length,
            "...but calls the cost function more than once per item, because it walks the "
                + "sequence once to find the lowest cost and then again to find an item that has "
                + "it - reread README ex6.");

        calls = 0;
        Teach.Equal("be", Costs.Cheapest(items, cost),
            "Two items cost 2, and the FIRST of them wins - which needs a strict less-than in "
                + "the comparison - reread README ex6.");
        Teach.Equal(items.Length, calls,
            "Exactly one call per item. Keeping the best item AND its cost as you go is what "
                + "avoids asking twice - reread README ex6.");

        Counting<string> counted = new Counting<string>("aaa", "b", "cc");
        Teach.Equal("b", Costs.Cheapest(counted, text => text.Length), "The shortest.");
        Teach.Equal(1, counted.Enumerations, "...found in a single pass over the source.");

        Teach.Equal("only", Costs.Cheapest(new[] { "only" }, text => text.Length),
            "One item is its own cheapest.");
        Teach.Throws<InvalidOperationException>(
            () => Costs.Cheapest(Array.Empty<string>(), text => text.Length),
            "There is no cheapest of nothing, and returning null would push the problem to the "
                + "caller - reread README ex6.");
    }

    [Fact]
    public void Ex7_ReadOnceReplayForEver()
    {
        Counting<int> source = new Counting<int>(1, 2, 3);
        Memoized<int> memo = new Memoized<int>(source);

        Teach.Equal(0, source.Reads,
            "Building the wrapper must not read anything - it is still lazy - reread README ex7.");
        Teach.Equal(0, memo.Cached, "...so nothing is cached yet.");

        Teach.Equal("1|2|3", string.Join("|", memo), "The first enumeration produces the items.");
        Teach.Equal(3, source.Reads, "...having read each one once.");
        Teach.Equal(3, memo.Cached, "...and kept them.");

        Teach.Equal("1|2|3", string.Join("|", memo),
            "The second enumeration produces exactly the same items - reread README ex7.");
        Teach.Equal(3, source.Reads,
            "...without touching the source again. That is the whole purpose: the wrapper turns "
                + "a sequence that may only be read once into one that can be read for ever - "
                + "reread README ex7.");
        Teach.Equal(1, source.Enumerations,
            "GetEnumerator was called on the source exactly once, in the constructor - reread "
                + "README ex7.");

        Counting<int> partial = new Counting<int>(1, 2, 3, 4, 5);
        Memoized<int> lazy = new Memoized<int>(partial);
        Teach.Equal(2, lazy.Take(2).Count(), "Two items asked for...");
        Teach.Equal(2, partial.Reads,
            "...and only two read. A wrapper that greedily copies the whole source in the "
                + "constructor would have read five - reread README ex7.");
        Teach.Equal("1|2|3|4|5", string.Join("|", lazy), "Later, the rest is still there...");
        Teach.Equal(5, partial.Reads, "...and the first two were not read again.");

        Counting<int> shared = new Counting<int>(1, 2, 3);
        Memoized<int> both = new Memoized<int>(shared);
        using (IEnumerator<int> first = both.GetEnumerator())
        using (IEnumerator<int> second = both.GetEnumerator())
        {
            first.MoveNext();
            second.MoveNext();
            Teach.Equal(1, first.Current, "Two enumerators walking at once both start at 1...");
            Teach.Equal(1, second.Current, "...as they must.");
            Teach.Equal(1, shared.Reads,
                "...and between them they pulled ONE item from the source: the second enumerator "
                    + "found it already cached - reread README ex7.");
        }

        Memoized<int> nothing = new Memoized<int>(Array.Empty<int>());
        Teach.Equal(0, nothing.Count(), "An empty source memoises to an empty sequence...");
        Teach.Equal(0, nothing.Count(), "...twice over, without throwing.");
    }

    [Fact]
    public void Ex8_ThreeAnswersOneReading()
    {
        string[] lines =
        {
            "the quick brown fox",
            "the lazy dog",
            "jumps over the lazy dog",
        };

        LineReport report = OnePass.Analyse(new OneShot<string>(lines));

        Teach.Equal(3, report.Count, "Three lines - reread README ex8.");
        Teach.Equal("jumps over the lazy dog", report.Longest,
            "The longest line by character count - reread README ex8.");
        Teach.Equal("the|quick|brown|fox|lazy|dog|jumps|over", string.Join("|", report.Words),
            "Every distinct word, in the order it was first seen - so a HashSet decides what is "
                + "new and a List remembers the order. A HashSet alone would lose the order and "
                + "Distinct() over a second pass is not available here - reread README ex8.");

        Counting<string> counted = new Counting<string>(lines);
        OnePass.Analyse(counted);
        Teach.Equal(1, counted.Enumerations,
            "All three answers came out of one walk. Three LINQ queries would have been three "
                + "walks, and over the one-shot source above the second one would have thrown - "
                + "reread README ex8.");
        Teach.Equal(3, counted.Reads, "...reading each line exactly once.");

        LineReport tied = OnePass.Analyse(new OneShot<string>("abcd", "efgh"));
        Teach.Equal("abcd", tied.Longest,
            "Equal lengths, and the FIRST one wins - a strict greater-than in the comparison - "
                + "reread README ex8.");

        LineReport repeats = OnePass.Analyse(new OneShot<string>("a a a", "a b"));
        Teach.Equal("a|b", string.Join("|", repeats.Words), "Repeats within a line count once too.");
        Teach.Equal(2, repeats.Count, "Two lines.");

        Teach.Throws<InvalidOperationException>(() => OnePass.Analyse(new OneShot<string>()),
            "No lines at all means there is no longest line to report - reread README ex8.");
    }
}
```
