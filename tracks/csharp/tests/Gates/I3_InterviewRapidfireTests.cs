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
