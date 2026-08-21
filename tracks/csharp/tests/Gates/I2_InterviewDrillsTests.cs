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
