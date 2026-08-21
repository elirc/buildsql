using CSharpDojo.I1_InterviewConcepts;

namespace CSharpDojo.Gates;

public class I1_InterviewConceptsTests
{
    [Fact]
    public void Ex1_EqualsAndTheEqualityOperatorAreDifferentQuestions()
    {
        string literal = "hello";
        string built = new string(new[] { 'h', 'e', 'l', 'l', 'o' });

        Teach.True(!Equality.SameObject(literal, built),
            "These are two separate string objects - one from the literal pool, one built at "
                + "runtime. ReferenceEquals is the only way to ask that question, because "
                + "string's own == was overloaded - reread README ex1.");

        Teach.True(Equality.SameObject(literal, literal),
            "The same reference twice is obviously the same object.");

        Teach.True(Equality.StringsEqual(literal, built),
            "== on two STRINGS compares the text, because string overloads the operator. This "
                + "is the exception, not the rule, for reference types - reread README ex1.");

        object boxedA = int.Parse("5");
        object boxedB = int.Parse("5");

        Teach.True(!Equality.ObjectsEqual(boxedA, boxedB),
            "Both boxes hold 5, and == on variables typed OBJECT is reference comparison - two "
                + "separate boxes, so false. This is the classic trap: the operator is chosen "
                + "at compile time from the STATIC type - reread README ex1.");

        Teach.True(Equality.ObjectsDotEquals(boxedA, boxedB),
            "Equals is virtual, so it dispatches on the RUNTIME type - Int32.Equals - and "
                + "compares the values: true. Same two objects, two different answers, and the "
                + "difference is which question you asked - reread README ex1.");
    }

    [Fact]
    public void Ex2_BoxingCopiesAndSoDoesAListIndexer()
    {
        Teach.Equal(1, Boxing.AfterMutatingTheOriginal(new Counter { Value = 1 }),
            "Boxing COPIES the value into the box. Changing the original afterwards cannot "
                + "reach it, so the box still holds 1 - reread README ex2.");

        Teach.Equal(1, Boxing.AfterMutatingAListCopy(),
            "A List<T> indexer on a struct hands back a COPY. Mutating that copy changes "
                + "nothing in the list - which is why mutable structs are a trap - reread "
                + "README ex2.");

        Teach.Equal(99, Boxing.AfterMutatingAListReference(),
            "The identical three lines with a CLASS give the opposite answer, because the copy "
                + "is a copy of the reference. One keyword changed the behaviour - reread "
                + "README ex2.");
    }

    private sealed class CountingNumbers : IEnumerable<int>
    {
        private readonly List<int> _items;

        public CountingNumbers(params int[] items) => _items = items.ToList();

        public int Enumerations { get; private set; }

        public IEnumerator<int> GetEnumerator()
        {
            Enumerations++;
            return _items.GetEnumerator();
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
    }

    [Fact]
    public void Ex3_ReadTheSequenceOnce()
    {
        CountingNumbers numbers = new CountingNumbers(10, 20, 30);

        Teach.Equal("3 items, total 60", Sequences.Summarise(numbers),
            "Three items adding to 60 - reread README ex3.");

        Teach.Equal(1, numbers.Enumerations,
            $"The source was walked {numbers.Enumerations} times. Any() + Count() + Sum() is "
                + "three walks; over an EF Core query that is three round trips to the "
                + "database. One foreach, or one ToList, is the fix - reread README ex3.");

        CountingNumbers empty = new CountingNumbers();

        Teach.Equal("no items", Sequences.Summarise(empty),
            "An empty sequence reports \"no items\" rather than \"0 items, total 0\".");
        Teach.Equal(1, empty.Enumerations,
            "And the empty case still walks it exactly once.");
    }

    [Fact]
    public async Task Ex4_AwaitInsteadOfBlockingAndReturnATask()
    {
        Teach.Equal(41, await AsyncFixes.LoadAsync(Task.FromResult(41)), "The ordinary path.");

        TaskCompletionSource<int> broken = new TaskCompletionSource<int>();
        broken.SetException(new InvalidOperationException("nope"));

        await Teach.ThrowsAsync<InvalidOperationException>(
            () => AsyncFixes.LoadAsync(broken.Task),
            "await rethrows the original exception; .Result would hand the caller an "
                + "AggregateException with this one buried inside - reread README ex4.");

        TaskCompletionSource work = new TaskCompletionSource();
        List<string> log = new List<string>();
        Task recording = AsyncFixes.RecordAsync(work.Task, log);

        Teach.Equal(0, log.Count,
            "Nothing has finished yet, so nothing should have been logged - reread README ex4.");

        work.SetResult();
        await recording;

        Teach.Equal("done", string.Join(", ", log), "The log entry happens after the await.");

        TaskCompletionSource failing = new TaskCompletionSource();
        failing.SetException(new InvalidOperationException("bad"));
        List<string> failedLog = new List<string>();

        await Teach.ThrowsAsync<InvalidOperationException>(
            () => AsyncFixes.RecordAsync(failing.Task, failedLog),
            "Because it returns a Task, the caller can await it and catch the failure. An "
                + "async void version would have crashed the process instead - reread README ex4.");

        Teach.Equal(0, failedLog.Count,
            "And the work failed, so the \"done\" line must never have been written.");
    }

    [Fact]
    public void Review1_ReferencesReassignmentAndImmutability()
    {
        List<int> items = new List<int> { 1 };
        Mixed.AddThenReassign(items);

        Teach.Equal("1, 99", string.Join(", ", items),
            "The Add reached the caller's list, because the parameter pointed at the same "
                + "object. The 1000 did NOT, because reassigning the parameter only repointed "
                + "a local copy of the reference - reread README review.");

        string original = "hello";
        string shouted = Mixed.Shout(original);

        Teach.Equal("HELLO", shouted, "Shout returns the upper-cased text.");
        Teach.Equal("hello", original,
            "...and the caller's string is untouched, because strings are IMMUTABLE. Every "
                + "\"modifying\" method returns a new one - reread README review.");

        Teach.True(!Mixed.SameInstance(original, shouted),
            "Which means they cannot be the same object.");
        Teach.True(Mixed.SameInstance(original, original),
            "The same reference is, of course, itself.");
    }
}
