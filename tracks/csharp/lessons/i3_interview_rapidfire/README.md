# i3 — Interview rapid-fire

Four short problems and a review, all on the concepts `i1` marks [***] - the
ones to expect in any C# interview - and all of them you have already met,
all deliberately in a different shape from the lesson that taught them. Nothing
here takes more than five minutes; everything here is something an interviewer
can ask on a whiteboard while you are still taking your coat off.

This lesson exists for one reason: **spacing**. You met value semantics in
lesson 01, deferred execution in lesson 10, the hash contract in lesson 06 and
async in lesson 13 — and everything you learn decays unless it comes back. The
whole lesson is marked as review material, so `dojo review` will resurface it at
three days, a week, three weeks and two months. The ladder does the repetition;
you just have to keep answering.

Work these cold. No hints on the first pass, no scrolling back to the lesson,
no compiler until you have written the whole body. If it does not come out, that
is information — go back to the lesson named in the gate's failure message, and
let the ladder bring it round again.

## Exercise 1 — where does the copy happen? (3 minutes)

Edit `src/Lessons/I3_InterviewRapidfire/Ex1.cs`. The same struct in three
containers: an array (write straight through it), a `List<T>` (where the direct
write does not compile, so copy-modify-write-back), and a method parameter.

Three answers, one rule. Predict all three before you run the gate.

```
uv run dojo test csharp i3_interview_rapidfire ex1
```

## Exercise 2 — the key contract (5 minutes)

Edit `src/Lessons/I3_InterviewRapidfire/Ex2.cs`. Override `Equals` and
`GetHashCode` on `Coordinate` so that two positions with the same X and Y are
one key, then count distinct positions with a `HashSet`.

Watch the hash: `X ^ Y` cannot tell `(5, 6)` from `(6, 5)`, which is legal and
turns your set into a linear scan.

```
uv run dojo test csharp i3_interview_rapidfire ex2
```

## Exercise 3 — lazy queries and captured variables (5 minutes)

Edit `src/Lessons/I3_InterviewRapidfire/Ex3.cs`. `Above` returns a query — not a
result — that compares against whatever the threshold function says **at the
moment it is enumerated**. `Indexes` builds three functions in a `for` loop that
return 0, 1 and 2, which the naive version does not.

The gate enumerates the same query twice with the threshold changed in between.
If your answer is the same both times, you materialised it.

```
uv run dojo test csharp i3_interview_rapidfire ex3
```

## Exercise 4 — async outcomes (5 minutes)

Edit `src/Lessons/I3_InterviewRapidfire/Ex4.cs`. Both methods wait for **every**
task and then report on the outcomes without throwing: how many succeeded, and
the total of the successful ones.

Awaiting `Task.WhenAll` throws when any task failed, and rethrows only the
first exception — so the waiting and the answering are two separate steps.

```
uv run dojo test csharp i3_interview_rapidfire ex4
```

## Review

`review1` is three one-liners with no notes: what `Equals` says about two boxed
`7`s, whether `Trim` changed the caller's string, and what a box holds after the
variable moved. Two minutes, cold.

## The gate

This is the entire gate class, `tests/Gates/I3_InterviewRapidfireTests.cs`:

```csharp
using CSharpDojo.I3_InterviewRapidfire;

namespace CSharpDojo.Gates;

public class I3_InterviewRapidfireTests
{
    [Fact]
    public void Ex1_WhereTheCopyHappens()
    {
        Teach.Equal(9, ValueSemantics.ThroughArray(),
            "Array indexing yields a real reference into the array's storage, so writing "
                + "through it changes the element itself - reread README ex1.");

        Teach.Equal(9, ValueSemantics.ThroughListWriteBack(),
            "A List<T> indexer hands back a COPY, so you have to write the modified copy back "
                + "for the change to stick. list[0].Brightness = 9 does not even compile - "
                + "reread README ex1.");

        Pixel pixel = new Pixel { Brightness = 1 };
        int returned = ValueSemantics.Bump(pixel);

        Teach.Equal(9, returned, "Inside the method the change is perfectly real...");
        Teach.Equal(1, pixel.Brightness,
            "...and the caller's pixel never moved, because the argument was COPIED at the "
                + "call. Three containers, three answers, one rule - reread README ex1.");
    }

    [Fact]
    public void Ex2_TheKeyContract()
    {
        List<Coordinate> points = new List<Coordinate>
        {
            new Coordinate(1, 2),
            new Coordinate(1, 2),
            new Coordinate(3, 4),
        };

        Teach.Equal(2, Grid.DistinctCount(points),
            "Two of the three are the same position. Without an Equals override this returns "
                + "3, because a plain class compares by reference - reread README ex2.");

        Coordinate key = new Coordinate(5, 6);
        Coordinate twin = new Coordinate(5, 6);

        Teach.True(key.Equals(twin), "Same X and Y is the same coordinate.");
        Teach.True(!key.Equals(new Coordinate(6, 5)),
            "Order matters: (5, 6) is not (6, 5). If this failed you compared a sum or a "
                + "product instead of the two values.");
        Teach.True(!key.Equals("5,6"),
            "Equals takes an object and can be handed anything - a type test comes first.");

        Teach.Equal(key.GetHashCode(), twin.GetHashCode(),
            "Equal objects MUST hash the same, or the HashSet above never even calls your "
                + "Equals - reread README ex2.");

        Dictionary<Coordinate, string> cells = new Dictionary<Coordinate, string> { [key] = "here" };
        Teach.True(cells.ContainsKey(twin),
            "And this is what the contract buys: a lookup with a different but equal key.");
    }

    [Fact]
    public void Ex3_LazyQueriesAndCapturedVariables()
    {
        int limit = 5;
        IEnumerable<int> query = LazyAndClosures.Above(new[] { 1, 6, 10 }, () => limit);

        Teach.Equal("6, 10", string.Join(", ", query),
            "Above 5, at the moment of enumeration - reread README ex3.");

        limit = 8;

        Teach.Equal("10", string.Join(", ", query),
            "The SAME query object, enumerated again after the threshold moved, gives a "
                + "different answer - because a query is a plan, and the plan reads the "
                + "captured variable each time it runs. If you got \"6, 10\" again you "
                + "materialised it - reread README ex3.");

        List<Func<int>> indexes = LazyAndClosures.Indexes();

        Teach.Equal("0, 1, 2", string.Join(", ", indexes.Select(f => f())),
            "The naive for-loop version gives 3, 3, 3 - one variable, captured three times. "
                + "Copying it into a fresh local INSIDE the loop body gives each lambda its "
                + "own - reread README ex3.");
    }

    [Fact]
    public async Task Ex4_WaitForEverythingThenLookAtTheOutcomes()
    {
        Task<int>[] allGood =
        {
            Task.FromResult(1), Task.FromResult(2), Task.FromResult(3),
        };

        Teach.Equal(3, await AsyncRapid.CountSucceededAsync(allGood), "All three succeeded.");
        Teach.Equal(6, await AsyncRapid.TotalOfSucceededAsync(allGood), "1 + 2 + 3.");

        TaskCompletionSource<int> broken = new TaskCompletionSource<int>();
        broken.SetException(new InvalidOperationException("nope"));
        Task<int>[] mixed = { Task.FromResult(4), broken.Task, Task.FromResult(6) };

        Teach.Equal(2, await AsyncRapid.CountSucceededAsync(mixed),
            "Two of three finished successfully. Awaiting WhenAll throws, so this needs a "
                + "try/catch and then a look at each task's own outcome - reread README ex4.");

        Teach.Equal(10, await AsyncRapid.TotalOfSucceededAsync(mixed),
            "4 + 6: the failed one contributes nothing, and reading .Result on it would "
                + "rethrow - filter on IsCompletedSuccessfully first - reread README ex4.");

        TaskCompletionSource<int> alsoBroken = new TaskCompletionSource<int>();
        alsoBroken.SetException(new TimeoutException("slow"));
        Task<int>[] allBad = { broken.Task, alsoBroken.Task };

        Teach.Equal(0, await AsyncRapid.CountSucceededAsync(allBad),
            "Everything failed, and the method still returned an answer rather than throwing. "
                + "Note WhenAll rethrows only the FIRST exception - the others are only "
                + "visible on the tasks themselves.");
    }

    [Fact]
    public void Review1_ThreeAnswersWithoutLookingAnythingUp()
    {
        object first = int.Parse("7");
        object second = int.Parse("7");

        Teach.True(Cold.EqualsSays(first, second),
            "Equals is virtual, so it reaches Int32.Equals and compares the values - even "
                + "though == on two objects would have said false - reread README review.");

        string padded = "  spaced  ";
        string trimmed = Cold.Trimmed(padded);

        Teach.Equal("spaced", trimmed, "Trim removes the surrounding whitespace...");
        Teach.Equal("  spaced  ", padded,
            "...and the original is untouched, because strings are immutable and Trim RETURNS "
                + "a new one - reread README review.");

        Teach.Equal(1, Cold.BoxedThenChanged(),
            "Boxing copies. The box was made from the value 1, and changing the variable "
                + "afterwards cannot reach inside it - reread README review.");
    }
}
```

In plain English: `Ex1` reads the same struct back out of an array, a list and a
parameter. `Ex2` counts distinct coordinates, checks `Equals` against a twin, a
mirror image, a string and a hash, then uses one as a dictionary key. `Ex3`
enumerates one query twice with the threshold moved in between, and calls the
three loop-built functions. `Ex4` counts and totals successful tasks across an
all-good list, a mixed one and an all-failed one. `Review1` is the
spaced-repetition variant.

## The teaching point

The concepts in this lesson are the ones that come back on the day, and they are
also the ones that decay fastest — because you use them constantly *without
thinking about them*, which is exactly the state in which you cannot explain
them.

So the value of a rapid-fire round is not the code. It is the sentence you say
afterwards: "a struct is copied on assignment, on argument passing and on a
`List<T>` read, but not on array indexing". "A query is a plan; enumerating it
runs it again." "Equal objects must hash the same or the lookup never even
compares them." "`WhenAll` waits for everything and rethrows the first failure."

Four sentences, each earned by writing the code that proves it. When those come
out in eleven seconds without a pause, you are ready — and `dojo review` is what
keeps them there.

That is the end of the C# track. `uv run dojo status csharp` shows the whole
tree; `uv run dojo review` will keep the important parts coming back.
