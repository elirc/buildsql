# i2 — Interview drills

Six tasks and one long one, written the way an interviewer would actually say
them, with a time-box on each. These are not invented: an LRU cache, a
word-frequency count, a disposable wrapper, a broken async method and a custom
comparer are the tasks that come up again and again for mid-level .NET roles,
because each one is small enough for 20 minutes and reveals whether you have
used the language in anger.

Treat the time-boxes as real. Set a timer, work without looking anything up,
and stop when it goes off even if you are not finished — then read the hints and
finish properly. The point of the clock is not speed; it is finding out which
parts you can produce without thinking, because that is what you will have on
the day.

One more thing worth knowing about how these are marked in a real interview:
**the code is about half of it.** The rest is whether you asked about the edge
cases before writing, whether you can say why you chose a `LinkedList`, and
whether you notice the thread-safety question before they ask. Every hints file
here ends with the follow-up you should expect.

## Exercise 1 — FizzBuzz, with a twist (10 minutes)

> "Everyone's done FizzBuzz. Do it again, but I want the rules to be data — I
> should be able to hand you `(3, "Fizz")` and `(5, "Buzz")`, or add a `(7,
> "Bang")` later without you touching the method. Return the sequence rather
> than printing it."

Edit `src/Lessons/I2_InterviewDrills/Ex1.cs`. For each number in the inclusive
range, join the words of every rule whose divisor divides it, in rule order; a
number matching nothing is its own text.

If your solution has `n % 15` in it, the twist has beaten you.

```
uv run dojo test csharp i2_interview_drills ex1
```

## Exercise 2 — an LRU cache (25 minutes)

> "Implement a cache with a fixed capacity. When it is full and something new
> arrives, throw out whatever was used least recently. Reads count as use. I
> want both operations O(1)."

Edit `src/Lessons/I2_InterviewDrills/Ex2.cs`. `TryGet`, `Put`, `Count` and
`KeysNewestFirst` — the last one exists so the gate can check the ordering.

The O(1) requirement is the question. A dictionary alone cannot tell you what
was used least recently; a list alone cannot find a key quickly. The two fields
declared in the file are the standard answer, and knowing *why* they are the
standard answer is what is being tested.

```
uv run dojo test csharp i2_interview_drills ex2
```

## Exercise 3 — word frequency (15 minutes)

> "Given a chunk of text, give me the N most common words with their counts.
> Case doesn't matter, punctuation isn't part of a word, and I want it
> deterministic — same input, same output, every time."

Edit `src/Lessons/I2_InterviewDrills/Ex3.cs`. Most frequent first, ties broken
alphabetically, formatted `"word: n"`.

"Deterministic" is the tie-break asking to be noticed. Without it, two words
with the same count come out in whatever order the grouping produced.

```
uv run dojo test csharp i2_interview_drills ex3
```

## Exercise 4 — a disposable resource wrapper (15 minutes)

> "We hand out database connections from a pool. Write me the wrapper the
> calling code puts in a `using`, so the connection goes back when the block
> ends. And make it obvious if somebody keeps using it afterwards."

Edit `src/Lessons/I2_InterviewDrills/Ex4.cs`. `Connection` hands back the
borrowed connection or throws `ObjectDisposedException`; `Dispose` returns it to
the pool exactly once however many times it is called.

The double-dispose rule is not pedantry here: returning the same connection to
the pool twice hands it to two callers at once.

```
uv run dojo test csharp i2_interview_drills ex4
```

## Exercise 5 — fix this async code (10 minutes)

> "A colleague wrote this and it's in production. It blocks a thread, it ignores
> the cancellation token it was given, and it swallows exceptions and returns
> zero. Fix all three."

Edit `src/Lessons/I2_InterviewDrills/Ex5.cs`. `TotalAsync(pages, token)` adds up
every page's count: awaiting rather than blocking, honouring the token both
before it starts and while it waits, and letting a failure travel to the caller.

Be ready to say what each of the three bugs actually does — the fix is three
lines and the explanation is the interview.

```
uv run dojo test csharp i2_interview_drills ex5
```

## Exercise 6 — a custom equality comparer (15 minutes)

> "We're deduplicating contacts. Two contacts are the same person if the email
> matches — ignore case, ignore whitespace, ignore the name. The `Contact` type
> isn't ours to change."

Edit `src/Lessons/I2_InterviewDrills/Ex6.cs`. Implement
`IEqualityComparer<Contact>` and use it to count distinct people.

"Isn't ours to change" is the clue for *why* a comparer rather than an `Equals`
override. And the framework will call your `Equals` with nulls, so handle them.

```
uv run dojo test csharp i2_interview_drills ex6
```

## Challenge — the 45-minute task

> "Build me a small in-memory order service. I can place an order for a customer
> with some lines and get back an id. I can ask what an order cost. I can ask
> for the top N customers by spend. Validate the inputs properly, and make it
> `IDisposable` so we can shut it down cleanly."

Edit `src/Lessons/I2_InterviewDrills/Challenge.cs`. The full specification is in
the file's doc comments: id format, which exception for which bad input,
`KeyNotFoundException` for an unknown id, the top-customers report with its
tie-break, and `ObjectDisposedException` from every member after disposal.

Honest difficulty note: nothing here is hard on its own — it is lesson 03's
encapsulation, lesson 11's grouping and lesson 12's exceptions in one class.
The difficulty is *keeping all the rules in your head at once*, which is exactly
what the real version of this task tests. Read the whole specification and write
the rules down before you start typing.

```
uv run dojo test csharp i2_interview_drills challenge
```

## Review

`review1` is the LRU idea in its simple form — a "recently opened" list, newest
first, deduplicated and bounded. `dojo review` will bring it back.

## The gate

This is the entire gate class, `tests/Gates/I2_InterviewDrillsTests.cs`:

```csharp
using CSharpDojo.I2_InterviewDrills;

namespace CSharpDojo.Gates;

public class I2_InterviewDrillsTests
{
    private static readonly (int Divisor, string Word)[] Classic =
    {
        (3, "Fizz"), (5, "Buzz"),
    };

    [Fact]
    public void Ex1_FizzBuzzWithConfigurableRules()
    {
        Teach.Equal(
            "1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz",
            string.Join(", ", FizzBuzz.Run(1, 15, Classic)),
            "The classic game: 15 matches both rules, so both words are joined in rule order "
                + "- reread README ex1.");

        Teach.Equal("1, Even, 3, Even",
            string.Join(", ", FizzBuzz.Run(1, 4, new[] { (2, "Even") })),
            "One rule, and the numbers it does not match come through as text.");

        Teach.Equal("1, 2, 3", string.Join(", ", FizzBuzz.Run(1, 3, Array.Empty<(int, string)>())),
            "No rules at all means every number is just itself - and no special case in your "
                + "code should be needed for that.");

        Teach.Equal("BuzzFizz", string.Join(", ", FizzBuzz.Run(15, 15, new[] { (5, "Buzz"), (3, "Fizz") })),
            "The words come out in RULE order, not divisor order: reversing the rules reverses "
                + "the output - reread README ex1.");

        Teach.Equal(0, FizzBuzz.Run(5, 1, Classic).Count,
            "A range that runs backwards is empty rather than an exception.");
    }

    [Fact]
    public void Ex2_LruCacheEvictsTheLeastRecentlyUsed()
    {
        LruCache<string, int> cache = new LruCache<string, int>(2);
        cache.Put("a", 1);
        cache.Put("b", 2);

        Teach.Equal(2, cache.Count, "Two entries, and the cache holds two.");
        Teach.Equal("b, a", string.Join(", ", cache.KeysNewestFirst),
            "Newest first: b was put after a - reread README ex2.");

        Teach.True(cache.TryGet("a", out int found) && found == 1,
            "Reading a present key returns its value.");
        Teach.Equal("a, b", string.Join(", ", cache.KeysNewestFirst),
            "...and READING counts as using it, so a is now the newest. If the order did not "
                + "change, TryGet is not refreshing recency - reread README ex2.");

        cache.Put("c", 3);

        Teach.Equal(2, cache.Count, "Still two: the cache never exceeds its capacity.");
        Teach.True(!cache.TryGet("b", out _),
            "b was the least recently used, so b is the one that was evicted - reread "
                + "README ex2.");
        Teach.True(cache.TryGet("a", out _), "a survived because it had just been read.");

        cache.Put("a", 99);
        Teach.Equal(2, cache.Count, "Updating an existing key does not add an entry.");
        Teach.True(cache.TryGet("a", out int updated) && updated == 99, "...and it updates the value.");
        Teach.Equal("a, c", string.Join(", ", cache.KeysNewestFirst),
            "An update also counts as use.");

        Teach.Throws<ArgumentOutOfRangeException>(() => new LruCache<string, int>(0),
            "A cache with no room is not a cache. (This guard is written for you.)");
    }

    [Fact]
    public void Ex3_WordFrequencyTopN()
    {
        Teach.Equal("the: 3, fox: 2, dog: 1",
            string.Join(", ", WordFrequency.Top("The quick fox; the dog, THE fox!", 3)),
            "Case-insensitive, punctuation is a separator, most frequent first with ties "
                + "broken alphabetically - so fox (2) beats dog (1), and \"the\" leads with 3 "
                + "- reread README ex3.");

        Teach.Equal("don: 1, t: 1", string.Join(", ", WordFrequency.Top("Don't", 5)),
            "Anything that is not a letter separates words, so an apostrophe splits \"Don't\" "
                + "in two. That is the specification, not an accident - reread README ex3.");

        Teach.Equal("a: 2", string.Join(", ", WordFrequency.Top("a A b", 1)),
            "count really does limit the result, and the two cases of \"a\" are one word.");

        Teach.Equal(0, WordFrequency.Top("   !!!  ", 3).Count,
            "No letters, no words, no output - and no crash.");
    }

    private sealed class FakeConnection : IConnection
    {
        public List<string> Commands { get; } = new List<string>();

        public void Execute(string command) => Commands.Add(command);
    }

    [Fact]
    public void Ex4_PooledConnectionGoesBackExactlyOnce()
    {
        Queue<IConnection> pool = new Queue<IConnection>();
        FakeConnection connection = new FakeConnection();

        using (PooledConnection borrowed = new PooledConnection(connection, pool))
        {
            borrowed.Connection.Execute("select 1");
            Teach.Equal(0, pool.Count,
                "While it is borrowed, the pool does not have it - reread README ex4.");
        }

        Teach.Equal(1, pool.Count,
            "Leaving the using block returned it, because using calls Dispose - reread "
                + "README ex4.");
        Teach.Equal("select 1", string.Join(", ", connection.Commands),
            "And the command really did reach the underlying connection.");

        PooledConnection second = new PooledConnection(connection, pool);
        second.Dispose();
        second.Dispose();

        Teach.Equal(2, pool.Count,
            "Disposing twice must return the connection ONCE. If the pool has three, your "
                + "Dispose is not guarded - and a pool with duplicates hands the same "
                + "connection to two callers - reread README ex4.");

        Teach.Throws<ObjectDisposedException>(() => second.Connection.Execute("nope"),
            "Using a wrapper after it has given the connection back is a bug, and the standard "
                + "way to say so is ObjectDisposedException - reread README ex4.");
    }

    [Fact]
    public async Task Ex5_TotalAsyncWithNoneOfTheThreeBugs()
    {
        Teach.Equal(6, await Pages.TotalAsync(
                new[] { Task.FromResult(1), Task.FromResult(2), Task.FromResult(3) },
                CancellationToken.None),
            "The ordinary path: every page's count added up - reread README ex5.");

        CancellationTokenSource alreadyCancelled = new CancellationTokenSource();
        alreadyCancelled.Cancel();

        await Teach.ThrowsAsync<OperationCanceledException>(
            () => Pages.TotalAsync(new[] { Task.FromResult(1) }, alreadyCancelled.Token),
            "An already-cancelled token means do nothing at all - check it before you start "
                + "- reread README ex5.");

        TaskCompletionSource<int> broken = new TaskCompletionSource<int>();
        broken.SetException(new TimeoutException("page timed out"));

        await Teach.ThrowsAsync<TimeoutException>(
            () => Pages.TotalAsync(new[] { Task.FromResult(1), broken.Task }, CancellationToken.None),
            "A failing page must not be swallowed and must not arrive wrapped in an "
                + "AggregateException - await, do not block, and do not catch what you cannot "
                + "handle - reread README ex5.");

        TaskCompletionSource<int> pending = new TaskCompletionSource<int>();
        CancellationTokenSource later = new CancellationTokenSource();
        Task<int> waiting = Pages.TotalAsync(new[] { pending.Task }, later.Token);

        Teach.True(!waiting.IsCompleted, "Nothing has finished yet.");
        later.Cancel();

        await Teach.ThrowsAsync<OperationCanceledException>(
            () => waiting,
            "Cancelling while waiting must end the wait too - pass the token to the await "
                + "itself - reread README ex5.");
    }

    [Fact]
    public void Ex6_ACustomComparerDecidesWhatTheSameMeans()
    {
        List<Contact> contacts = new List<Contact>
        {
            new Contact("Ada", "ada@example.com"),
            new Contact("A. Lovelace", "ADA@example.com "),
            new Contact("Bo", "bo@example.com"),
        };

        Teach.Equal(2, Contacts.DistinctPeople(contacts),
            "Two people: the first two contacts differ in name, case and trailing whitespace, "
                + "and are the same email address - reread README ex6.");

        EmailComparer comparer = new EmailComparer();
        Contact one = new Contact("Ada", "ada@example.com");
        Contact two = new Contact("Someone Else", "ADA@EXAMPLE.COM");

        Teach.True(comparer.Equals(one, two), "Same address, ignoring case.");
        Teach.Equal(comparer.GetHashCode(one), comparer.GetHashCode(two),
            "Equal items MUST hash the same, or the HashSet looks in the wrong bucket and your "
                + "Equals never gets called - reread README ex6.");

        Teach.True(!comparer.Equals(one, null), "Nothing equals null...");
        Teach.True(comparer.Equals(null, null), "...except null, which the framework may ask "
            + "about. A comparer that throws on null is a comparer that crashes on real data.");

        Teach.Equal(0, Contacts.DistinctPeople(new List<Contact>()), "Nobody is nobody.");
    }

    [Fact]
    public void Challenge_TheOrderServiceEndToEnd()
    {
        OrderService service = new OrderService();

        string first = service.Place("ada", new[]
        {
            new OrderLine("SKU-1", 2, 10m),
            new OrderLine("SKU-2", 1, 5m),
        });

        Teach.Equal("ORD-1", first, "Ids start at ORD-1 - reread README challenge.");
        Teach.Equal(25m, service.TotalFor(first), "2 x 10 plus 1 x 5.");

        string second = service.Place("bo", new[] { new OrderLine("SKU-1", 10, 10m) });
        Teach.Equal("ORD-2", second, "The next id follows on.");

        service.Place("ada", new[] { new OrderLine("SKU-3", 1, 80m) });

        Teach.Equal("ada: 105, bo: 100", string.Join(", ", service.TopCustomers(5)),
            "ada spent 25 + 80 and bo spent 100, so ada leads. One line per CUSTOMER, not per "
                + "order - reread README challenge.");
        Teach.Equal("ada: 105", string.Join(", ", service.TopCustomers(1)),
            "count limits the report.");

        Teach.Throws<ArgumentException>(
            () => service.Place("  ", new[] { new OrderLine("SKU-1", 1, 1m) }),
            "An order with no customer is a caller bug - ArgumentException.");
        Teach.Throws<ArgumentException>(
            () => service.Place("cy", Array.Empty<OrderLine>()),
            "So is an order with no lines.");
        Teach.Throws<ArgumentOutOfRangeException>(
            () => service.Place("cy", new[] { new OrderLine("SKU-1", 0, 1m) }),
            "A quantity of zero is out of range specifically - the more precise exception type "
                + "tells the caller what to fix - reread README challenge.");
        Teach.Throws<KeyNotFoundException>(
            () => service.TotalFor("ORD-999"),
            "An id that was never issued is not an empty order - say so.");

        service.Dispose();
        service.Dispose();

        Teach.Throws<ObjectDisposedException>(
            () => service.TotalFor("ORD-1"),
            "After Dispose the service is out of business, and every member says so. Disposing "
                + "twice must be harmless - reread README challenge.");
        Teach.Throws<ObjectDisposedException>(
            () => service.Place("ada", new[] { new OrderLine("SKU-1", 1, 1m) }),
            "...including Place.");
    }

    [Fact]
    public void Review1_MostRecentlyUsedList()
    {
        RecentItems recent = new RecentItems(3);
        recent.Touch("a");
        recent.Touch("b");
        recent.Touch("c");

        Teach.Equal("c, b, a", string.Join(", ", recent.Items),
            "Newest first - reread README review.");

        recent.Touch("a");
        Teach.Equal("a, c, b", string.Join(", ", recent.Items),
            "Touching something already in the list MOVES it to the front rather than adding a "
                + "second copy - reread README review.");
        Teach.Equal(3, recent.Items.Count, "Still three items, not four.");

        recent.Touch("d");
        Teach.Equal("d, a, c", string.Join(", ", recent.Items),
            "Over capacity, so the oldest - b - falls off the end.");

        Teach.Throws<ArgumentOutOfRangeException>(() => new RecentItems(0),
            "A zero-capacity list is not a list. (Written for you.)");
    }
}
```

In plain English: `Ex1` runs the classic game, a one-rule game, a no-rule game,
a reversed-rule game and a backwards range. `Ex2` drives a two-entry cache
through put, read, evict and update, checking the recency order after each step.
`Ex3` counts a punctuated sentence, splits an apostrophe, and handles text with
no letters. `Ex4` borrows and returns a connection, disposes twice, and uses one
after disposal. `Ex5` totals three pages, cancels before and during, and fails
one page. `Ex6` deduplicates contacts and checks the hash agrees with the
equality. `Challenge` places three orders, reports, and walks every validation
rule. `Review1` is the spaced-repetition variant.

## The teaching point

The pattern across all seven tasks: **the interesting part is never the happy
path.** FizzBuzz is trivial; making the rules data is not. Counting words is
trivial; making the output deterministic is not. Summing tasks is trivial;
cancellation and failure are not. Interviewers pick these problems precisely
because the naive version takes four minutes, leaving twenty to find out how you
think about the rest.

So the habit worth building is the one this course has been drilling since
lesson 02: **state the edge cases before you write the body.** Empty input.
Duplicate input. Already-cancelled. Already-disposed. Ties. Zero. Null. Say them
out loud, decide what each one does, and the code that follows is nearly always
straightforward — and you will have answered half the follow-up questions before
they are asked.

Next: **i3_interview_rapidfire**, which takes the [***] concepts and asks them
again, cold, on a schedule.
