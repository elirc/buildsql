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
