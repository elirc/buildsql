# i1 — Interview concepts

You have written every line of a C# course. This part is about being able to
*say* it — quickly, out loud, to somebody who is deciding whether to hire you,
with no compiler to check you and no time to look anything up.

That is a different skill from writing the code, and it is trainable. The
`reading.md` beside this file is a question bank: **56 questions with model
answers**, grouped by topic, each tagged by how often it actually comes up
([*] occasionally, [**] often, [***] expect it), each cross-referenced to the
lesson that teaches it, and each with the classic follow-up named so you are
not surprised by the second question.

The four exercises here are the concepts that can be *checked in code* — the
ones where saying the right words is not proof you have understood. Everything
else lives in the bank.

## How to use the question bank

Not by reading it. Reading a Q&A bank produces the warm feeling of recognition
and almost no recall, which is exactly the trap — you will feel prepared right
up until somebody asks.

The method that works:

1. **Cover the answer.** Read only the question.
2. **Say your answer out loud**, in full sentences, as if to a person. Out loud
   matters: the gap between "I know this" and "I can explain this" is entirely
   in the saying.
3. **Then read the model answer** and mark yourself: did you name the mechanism,
   or only the symptom? Did you give an example?
4. **Anything you missed, go back to the lesson.** Each answer says which one.

Do a topic a day rather than the whole bank in an evening. And when an answer
comes out fluently three times running, stop drilling it — the [***] ones come
back on their own through `dojo review`, which is what `i3_interview_rapidfire`
is for.

One more thing about interview answers: **length**. Three to six sentences is
right. Name the mechanism, give one concrete example, stop. Candidates lose
points far more often for rambling past the answer than for being too brief,
and stopping cleanly invites the follow-up you are prepared for.

## Exercise 1 — `==` versus `Equals`, cold

Edit `src/Lessons/I1_InterviewConcepts/Ex1.cs`. Four one-line methods:
`SameObject` (reference identity), `StringsEqual` (`==` on two `string`s),
`ObjectsEqual` (`==` on two `object`s), and `ObjectsDotEquals`.

**Report what the language says, do not correct it.** Two of the four answers
look wrong until you can explain them, and the gate hands you two boxed `5`s to
make the point: `==` is chosen at compile time from the *static* type, while
`Equals` is virtual and dispatches on the *runtime* type.

```
uv run dojo test csharp i1_interview_concepts ex1
```

## Exercise 2 — boxing, and the copy you did not ask for

Edit `src/Lessons/I1_InterviewConcepts/Ex2.cs`. Three methods that each perform
three steps in a fixed order: box a struct then mutate the original; take
`list[0]` of a struct into a local, mutate it, read the list back; and the same
with a class.

Predict all three answers before running the gate. This is a predict-the-output
exercise on purpose — the whole point is whether you can say what a copy is and
where one happens.

```
uv run dojo test csharp i1_interview_concepts ex2
```

## Exercise 3 — fix the multiple enumeration

Edit `src/Lessons/I1_InterviewConcepts/Ex3.cs`. `Summarise(numbers)` returns
`"3 items, total 60"`, or `"no items"` when there are none. The obvious
implementation calls `Any()`, `Count()` and `Sum()` — three separate walks of
the sequence, which over an EF Core query is three round trips to the database.

The gate counts the walks and demands exactly one.

```
uv run dojo test csharp i1_interview_concepts ex3
```

## Exercise 4 — fix the async bugs

Edit `src/Lessons/I1_InterviewConcepts/Ex4.cs`. `LoadAsync(work)` must return
the work's result without blocking and without wrapping the failure —
i.e. not `work.Result`. `RecordAsync(work, log)` must wait for the work and
then log `"done"`, returning a `Task` so that a caller can await it and catch
what it throws — i.e. not `async void`.

Both bodies are one or two lines. The exercise is being able to name what the
wrong versions do, which is why the gate checks the exception *type* and checks
that nothing is logged when the work fails.

```
uv run dojo test csharp i1_interview_concepts ex4
```

## Review

`review1` covers what a reference parameter can and cannot do, and string
immutability. `dojo review` will bring it back at 3, 7, 21 and 60 days — which
for the interview part is the entire point.

## The gate

This is the entire gate class, `tests/Gates/I1_InterviewConceptsTests.cs`:

```csharp
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
```

In plain English: `Ex1` compares a literal string with one built at runtime, and
two separately boxed `5`s, through all four methods. `Ex2` checks the three
predictions. `Ex3` uses a counting source and insists on exactly one
enumeration, including for the empty case. `Ex4` awaits a faulted task and
checks you get the original exception type, then drives a
`TaskCompletionSource` to prove the log entry happens after the work and never
when it failed. `Review1` is the spaced-repetition variant.

## The teaching point

Interviews reward two things this course has been building: **naming the
mechanism** rather than the symptom, and **having an example ready**.

"Structs are copied" is a symptom. "A struct variable holds its data inline, so
assignment, argument passing and a `List<T>` indexer all copy the whole value —
which is why `list[0].Value = 99` does not even compile" is a mechanism with an
example, and it takes eleven seconds to say.

The other thing worth knowing: interviewers are usually not checking whether you
memorised the answer. They are checking whether you have *thought about* it —
which is why the follow-up questions in the bank matter more than the answers.
"What happens if two threads call this?" and "how would you test that?" are
where the conversation actually happens, and you have written enough code in
this course to have opinions.

Next: **i2_interview_drills**, where you write the classic tasks under a clock.
