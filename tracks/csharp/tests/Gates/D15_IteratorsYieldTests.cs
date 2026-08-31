using System.Collections;

using CSharpDojo.D15_IteratorsYield;

namespace CSharpDojo.Gates;

public class D15_IteratorsYieldTests
{
    /// <summary>A source that reports how many items were pulled and how many walks began.</summary>
    private sealed class Probe : IEnumerable<int>
    {
        private readonly int[] _items;

        public Probe(params int[] items) => _items = items;

        public int Pulled { get; private set; }

        public int Walks { get; private set; }

        public IEnumerator<int> GetEnumerator()
        {
            Walks++;
            foreach (int item in _items)
            {
                Pulled++;
                yield return item;
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }

    [Fact]
    public void Ex1_TwoStraightforwardIterators()
    {
        Teach.Equal("3, 4, 5, 6", string.Join(", ", Ranges.UpTo(3, 6)),
            "Inclusive at both ends - reread README ex1.");
        Teach.Equal("5", string.Join(", ", Ranges.UpTo(5, 5)), "A one-item range is fine.");
        Teach.Equal("", string.Join(", ", Ranges.UpTo(7, 3)),
            "last below first yields NOTHING - no exception, no items. An iterator that never "
                + "reaches a yield is simply empty - reread README ex1.");

        Teach.Equal("ha, ha, ha", string.Join(", ", Ranges.Repeat("ha", 3)),
            "The same item, three times - reread README ex1.");
        Teach.Equal("", string.Join(", ", Ranges.Repeat("ha", 0)), "Zero times is empty...");
        Teach.Equal("", string.Join(", ", Ranges.Repeat("ha", -2)), "...and so is minus two.");
    }

    [Fact]
    public void Ex2_TransformingLazily()
    {
        Probe source = new Probe(1, 2);
        IEnumerable<int> stuttered = Transforms.Stutter(source);

        Teach.Equal(0, source.Pulled,
            "Calling Stutter reads nothing - the body does not run until somebody enumerates. "
                + "If this is not 0 you built a list - reread README ex2.");

        Teach.Equal("1, 1, 2, 2", string.Join(", ", stuttered),
            "Each item twice, in order: two yield statements inside one foreach - reread "
                + "README ex2.");

        Probe lazy = new Probe(1, 2, 3, 4, 5);
        Teach.Equal("1, 1, 2", string.Join(", ", Transforms.Stutter(lazy).Take(3)),
            "The first three stuttered items.");
        Teach.True(lazy.Pulled <= 2,
            $"Taking 3 stuttered items needs only 2 source items, not all 5 - it pulled "
                + $"{lazy.Pulled}. Yield hands items out one at a time - reread README ex2.");

        Teach.Equal("1. ada, 2. bo", string.Join(", ", Transforms.Numbered(new[] { "ada", "bo" })),
            "Numbering is 1-based and travels WITH the items - a counter local in the "
                + "iterator - reread README ex2.");
        Teach.Equal("", string.Join(", ", Transforms.Numbered(Array.Empty<string>())),
            "Nothing to number.");
    }

    [Fact]
    public void Ex3_InfiniteSequencesAreFine()
    {
        Teach.Equal("a, b, c, a, b, c, a", string.Join(", ", Endless.Cycle(new[] { "a", "b", "c" }).Take(7)),
            "Cycle repeats forever; Take(7) decides where to stop. Laziness is what makes an "
                + "infinite sequence safe to hold - reread README ex3.");

        Teach.Equal(0, Endless.Cycle(Array.Empty<string>()).Count(),
            "An EMPTY list must yield nothing rather than spin forever - guard before the "
                + "while(true) - reread README ex3.");

        Teach.Equal("5, 6, 7, 8", string.Join(", ", Endless.From(5).Take(4)),
            "From counts upward without end - reread README ex3.");
        Teach.Equal(7, Endless.From(5).First(n => n % 7 == 0),
            "First over an infinite sequence terminates as soon as something matches - it "
                + "pulled 5, 6, 7 and stopped.");
    }

    [Fact]
    public void Ex4_AdjacentPairsFromASinglePass()
    {
        Probe source = new Probe(3, 10, 6);

        Teach.Equal("(3, 10), (10, 6)", string.Join(", ", Pairs.Pairwise(source)),
            "Each item pairs with its successor - reread README ex4.");
        Teach.Equal(1, source.Walks,
            "ONE walk. If this is 2 you enumerated the source twice (Skip/Zip tricks do that); "
                + "remember the previous item in a local instead - reread README ex4.");

        Teach.Equal("7, -4", string.Join(", ", Pairs.Deltas(new[] { 3, 10, 6 })),
            "10-3 and 6-10: the change at each step - reread README ex4.");
        Teach.Equal("", string.Join(", ", Pairs.Pairwise(new[] { 5 })),
            "One item has no successor: no pairs.");
        Teach.Equal("", string.Join(", ", Pairs.Deltas(Array.Empty<int>())), "And nothing changes.");
    }

    [Fact]
    public void Ex5_ArgumentChecksMustNotWaitForEnumeration()
    {
        Teach.Throws<ArgumentOutOfRangeException>(() => Sampling.EveryNth(new[] { 1, 2 }, 0),
            "The throw must happen NOW, at the call - nobody has enumerated anything yet. A "
                + "method whose body contains yield postpones its ENTIRE body, guards included; "
                + "the fix is a plain wrapper method that validates and then returns a private "
                + "iterator - reread README ex5.");

        Teach.Equal("a, d, g", string.Join(", ", Sampling.EveryNth(new[] { "a", "b", "c", "d", "e", "f", "g" }, 3)),
            "Positions 0, 3 and 6 - reread README ex5.");
        Teach.Equal("a, b, c", string.Join(", ", Sampling.EveryNth(new[] { "a", "b", "c" }, 1)),
            "n = 1 keeps everything.");

        Probe source = new Probe(1, 2, 3);
        IEnumerable<int> sampled = Sampling.EveryNth(source, 2);
        Teach.Equal(0, source.Pulled,
            "The valid-n call still reads nothing until enumerated - the SPLIT is what makes "
                + "the check eager while the work stays lazy - reread README ex5.");
        Teach.Equal("1, 3", string.Join(", ", sampled), "...and then yields positions 0 and 2.");
    }

    [Fact]
    public void Ex6_WeavingTwoSequences()
    {
        Teach.Equal("one, x, two, three",
            string.Join(", ", Weaving.Weave(new[] { "one", "two", "three" }, new[] { "x" })),
            "Alternate while both have items; when one runs dry, the rest of the other "
                + "follows - reread README ex6.");

        Teach.Equal("a, 1, b, 2", string.Join(", ", Weaving.Weave(new[] { "a", "b" }, new[] { "1", "2" })),
            "Equal lengths alternate cleanly, first sequence leading.");

        Teach.Equal("only, items", string.Join(", ", Weaving.Weave(Array.Empty<string>(), new[] { "only", "items" })),
            "An empty first sequence leaves the second untouched - reread README ex6.");
        Teach.Equal("", string.Join(", ", Weaving.Weave(Array.Empty<string>(), Array.Empty<string>())),
            "Two empties weave to nothing.");
    }

    [Fact]
    public void Ex7_MergingTwoSortedSequences()
    {
        Teach.Equal("1, 2, 4, 4, 9, 30", string.Join(", ", Merging.Merge(new[] { 1, 4, 9 }, new[] { 2, 4, 30 })),
            "Always yield the smaller current item and advance ONLY that side. The duplicate "
                + "4 appears twice - merging keeps everything - reread README ex7.");

        Teach.Equal("1, 2", string.Join(", ", Merging.Merge(Array.Empty<int>(), new[] { 1, 2 })),
            "Merging with an empty side is just the other side.");
        Teach.Equal("5", string.Join(", ", Merging.Merge(new[] { 5 }, Array.Empty<int>())),
            "...in either direction.");

        Probe left = new Probe(1, 3, 5, 7, 9);
        Probe right = new Probe(2, 4, 6, 8);
        IEnumerable<int> merged = Merging.Merge(left, right);

        Teach.Equal(0, left.Pulled + right.Pulled,
            "Building the merge reads nothing - reread README ex7.");
        Teach.Equal("1, 2, 3", string.Join(", ", merged.Take(3)),
            "The first three of the merge...");
        Teach.True(left.Pulled <= 3 && right.Pulled <= 3,
            $"...cost at most three pulls per side (actual: left {left.Pulled}, right "
                + $"{right.Pulled}). A merge that ToList()ed its inputs pulls everything - "
                + "reread README ex7.");
    }

    [Fact]
    public void Ex8_WhenTheBodyActuallyRuns()
    {
        List<string> log = new List<string>();
        IEnumerable<int> steps = Tracing.Steps(log);
        Teach.Equal(0, log.Count,
            "Calling Steps runs NONE of the body - not even the first line. The compiler "
                + "turned it into an object that will run it later - reread README ex8.");

        using (IEnumerator<int> walker = steps.GetEnumerator())
        {
            Teach.Equal(0, log.Count, "GetEnumerator still runs nothing.");

            Teach.True(walker.MoveNext(), "The first MoveNext...");
            Teach.Equal("start", string.Join(", ", log),
                "...runs the body UP TO the first yield, and no further - reread README ex8.");
            Teach.Equal(1, walker.Current, "...and parks 1 in Current.");

            Teach.True(walker.MoveNext(), "The second MoveNext...");
            Teach.Equal("start, middle", string.Join(", ", log),
                "...resumes AFTER the first yield and runs to the second.");
            Teach.Equal(2, walker.Current, "Now 2.");

            Teach.True(!walker.MoveNext(), "The third MoveNext finds no more yields...");
            Teach.Equal("start, middle, end", string.Join(", ", log),
                "...but the code AFTER the last yield still ran on the way out.");
        }

        List<string> abandoned = new List<string>();
        foreach (int _ in Tracing.Steps(abandoned))
        {
            break;
        }

        Teach.Equal("start", string.Join(", ", abandoned),
            "Breaking out after one item means the rest of the body NEVER runs - \"middle\" "
                + "and \"end\" are missing. An abandoned iterator just stops - reread README ex8.");

        List<string> squares = new List<string>();
        Teach.Equal("1, 4", string.Join(", ", Tracing.Squares(squares, 5).Take(2)),
            "The first two squares.");
        Teach.Equal("computing 1, computing 2", string.Join(", ", squares),
            "Take(2) caused exactly two computations of five - lazy work is work never "
                + "done - reread README ex8.");
    }
}
