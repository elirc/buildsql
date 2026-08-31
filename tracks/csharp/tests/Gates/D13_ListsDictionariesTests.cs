using CSharpDojo.D13_ListsDictionaries;

namespace CSharpDojo.Gates;

public class D13_ListsDictionariesTests
{
    [Fact]
    public void Ex1_InsertRemoveAndTheIndexes()
    {
        List<string> agenda = new List<string> { "intro", "budget", "planning", "close" };

        Teach.True(Agenda.MoveToTop(agenda, "planning"), "The item is in the list, so it moves.");
        Teach.Equal("planning, intro, budget, close", string.Join(", ", agenda),
            "MoveToTop removes the item from where it was and inserts it at index 0 - everything "
                + "else keeps its order - reread README ex1.");

        Teach.True(!Agenda.MoveToTop(agenda, "lunch"), "An absent item reports false...");
        Teach.Equal("planning, intro, budget, close", string.Join(", ", agenda),
            "...and the list is untouched.");

        Agenda.AddAfter(agenda, "intro", "questions");
        Teach.Equal("planning, intro, questions, budget, close", string.Join(", ", agenda),
            "AddAfter inserts at IndexOf(anchor) + 1, shifting everything behind it right - "
                + "reread README ex1.");

        Agenda.AddAfter(agenda, "missing", "notes");
        Teach.Equal("planning, intro, questions, budget, close, notes", string.Join(", ", agenda),
            "No anchor means the item goes on the END. IndexOf answered -1, and -1 + 1 = 0 is "
                + "the WRONG place to insert - handle the miss explicitly - reread README ex1.");

        Agenda.Swap(agenda, 0, 5);
        Teach.Equal("notes", agenda[0], "A swap is two reads and two writes...");
        Teach.Equal("planning", agenda[5], "...as long as you saved one value before overwriting it.");

        Teach.Throws<ArgumentOutOfRangeException>(() => Agenda.Swap(agenda, 0, 99),
            "Indexing a List past Count throws ArgumentOutOfRangeException - no guard of your "
                + "own is needed, the indexer already has one - reread README ex1.");
    }

    [Fact]
    public void Ex2_ACountingDictionaryWithARemoveRule()
    {
        Dictionary<string, int> stock = new Dictionary<string, int>();

        Stockroom.Restock(stock, new[] { ("bolt", 40), ("nut", 100) });
        Stockroom.Restock(stock, new[] { ("bolt", 10) });

        Teach.Equal(50, stock["bolt"],
            "A second delivery ADDS to the line. GetValueOrDefault (or TryGetValue) turns the "
                + "missing-key case into a zero to add to - reread README ex2.");
        Teach.Equal(100, stock["nut"], "The other line is untouched.");

        Teach.True(!Stockroom.Take(stock, "washer", 1),
            "Taking something never stocked reports false rather than throwing - reread README ex2.");
        Teach.True(!Stockroom.Take(stock, "bolt", 51), "Not enough bolts: refuse...");
        Teach.Equal(50, stock["bolt"], "...and a refused take must not change the count.");

        Teach.True(Stockroom.Take(stock, "bolt", 20), "Twenty of fifty is fine...");
        Teach.Equal(30, stock["bolt"], "...leaving thirty.");

        Teach.True(Stockroom.Take(stock, "nut", 100), "Taking the exact balance works too...");
        Teach.True(!stock.ContainsKey("nut"),
            "...and removes the line ENTIRELY: a zero row and a missing row must look the same "
                + "to callers, so Remove the key - reread README ex2.");

        Teach.Throws<ArgumentOutOfRangeException>(
            () => Stockroom.Restock(stock, new[] { ("bolt", 0) }),
            "A delivery of zero (or fewer) is a data error, not a no-op - reread README ex2.");
    }

    [Fact]
    public void Ex3_AddOverwriteAndTryAdd()
    {
        Dictionary<string, string> offices = new Dictionary<string, string>();

        Roster.Assign(offices, "ada", "301");
        Roster.Assign(offices, "bo", "302");
        Roster.Assign(offices, "ada", "302");

        Teach.Equal("302", offices["ada"],
            "Assign is add-or-move: the indexer overwrites where Add would have thrown "
                + "ArgumentException on the second ada - reread README ex3.");
        Teach.Equal(2, offices.Count, "Two people, however many moves.");

        Teach.True(Roster.AssignNew(offices, "cy", "301"), "cy had no desk, so this sticks...");
        Teach.True(!Roster.AssignNew(offices, "cy", "303"), "...a second attempt reports false...");
        Teach.Equal("301", offices["cy"],
            "...and moves nobody. That is the TryAdd contract: only-if-absent, and the answer "
                + "tells you which happened - reread README ex3.");

        Teach.Equal("ada, bo", string.Join(", ", Roster.OccupantsOf(offices, "302")),
            "Who sits in 302 means scanning the VALUES: the dictionary is indexed by person, "
                + "not by office, so this query goes against the grain - reread README ex3.");
        Teach.Equal(0, Roster.OccupantsOf(offices, "999").Count, "An empty office is an empty list.");
    }

    [Fact]
    public void Ex4_SortingInPlaceAndSortingACopy()
    {
        List<Entry> season = new List<Entry>
        {
            new Entry("mira", 12),
            new Entry("kai", 30),
            new Entry("ada", 12),
            new Entry("rex", 21),
        };

        List<Entry> ranked = Leaderboard.Ranked(season);

        Teach.Equal("kai, rex, ada, mira", string.Join(", ", ranked.Select(e => e.Player)),
            "Highest score first; ada and mira tie on 12 and the name breaks it - reread README ex4.");
        Teach.Equal("mira, kai, ada, rex", string.Join(", ", season.Select(e => e.Player)),
            "Ranked returns a NEW list: the caller's list must still be in its original order. "
                + "OrderBy copies; List.Sort would have mutated - reread README ex4.");

        Leaderboard.SortInPlace(season);
        Teach.Equal("kai, rex, ada, mira", string.Join(", ", season.Select(e => e.Player)),
            "SortInPlace really does rearrange the caller's list - same ordering rule, opposite "
                + "contract. A Comparison<T> answers negative, zero or positive; compare scores "
                + "DESCENDING first, then names ascending - reread README ex4.");

        List<Entry> single = new List<Entry> { new Entry("solo", 1) };
        Leaderboard.SortInPlace(single);
        Teach.Equal(1, single.Count, "One entry sorts to itself.");
        Teach.Equal(0, Leaderboard.Ranked(new List<Entry>()).Count, "And nothing sorts to nothing.");
    }

    [Fact]
    public void Ex5_RemovingWithoutTrippingTheEnumerator()
    {
        Dictionary<string, int> sensors = new Dictionary<string, int>
        {
            ["hall"] = 19,
            ["porch"] = 4,
            ["attic"] = 12,
            ["cellar"] = 3,
        };

        Teach.Equal(2, Cleanup.DropBelow(sensors, 10),
            "porch (4) and cellar (3) go. Removing from a dictionary INSIDE a foreach over it "
                + "throws InvalidOperationException - collect the doomed keys into a list first, "
                + "then remove - reread README ex5.");
        Teach.Equal(2, sensors.Count, "Two survivors...");
        Teach.True(sensors.ContainsKey("hall") && sensors.ContainsKey("attic"), "...the right two.");

        Teach.Equal(0, Cleanup.DropBelow(sensors, 5),
            "Nothing below 5 is left, and asking again is harmless.");

        List<int> readings = new List<int> { 8, 2, 9, 1, 5 };
        Teach.Equal(2, Cleanup.DropWhere(readings, r => r < 5),
            "RemoveAll answers with the number removed - reread README ex5.");
        Teach.Equal("8, 9, 5", string.Join(", ", readings),
            "...and the survivors keep their relative order.");
        Teach.Equal(0, Cleanup.DropWhere(readings, r => r > 100),
            "A predicate that condemns nobody removes nothing.");
    }

    [Fact]
    public void Ex6_ATupleIsAPerfectlyGoodKey()
    {
        Dictionary<(string From, string To), decimal> fares =
            new Dictionary<(string From, string To), decimal>();

        Fares.Set(fares, "leeds", "york", 9m);
        Fares.Set(fares, "leeds", "hull", 12m);
        Fares.Set(fares, "york", "leeds", 7m);
        Fares.Set(fares, "leeds", "york", 8m);

        Teach.Equal(3, fares.Count,
            "Setting leeds->york twice overwrote one entry rather than adding a fourth - "
                + "reread README ex6.");
        Teach.Equal(8m, Fares.PriceOf(fares, "leeds", "york"), "The later price won.");
        Teach.Equal(7m, Fares.PriceOf(fares, "york", "leeds"),
            "(york, leeds) is a DIFFERENT key from (leeds, york): tuples compare position by "
                + "position - reread README ex6.");
        Teach.True(Fares.PriceOf(fares, "york", "hull") is null,
            "An unknown route is null, not an exception - TryGetValue, as ever.");

        Teach.Equal("york", Fares.CheapestFrom(fares, "leeds"),
            "Of the routes leaving leeds, york at 8 beats hull at 12 - reread README ex6.");
        Teach.True(Fares.CheapestFrom(fares, "hull") is null, "No route leaves hull.");

        Fares.Set(fares, "leeds", "goole", 8m);
        Teach.Equal("goole", Fares.CheapestFrom(fares, "leeds"),
            "goole and york now tie at 8, and the destination name breaks the tie A-Z - "
                + "reread README ex6.");
    }

    [Fact]
    public void Ex7_ADictionaryInsideADictionary()
    {
        Dictionary<string, Dictionary<string, int>> book =
            new Dictionary<string, Dictionary<string, int>>();

        Gradebook.Record(book, "ada", "maths", 90);
        Gradebook.Record(book, "ada", "music", 70);
        Gradebook.Record(book, "bo", "maths", 80);
        Gradebook.Record(book, "ada", "maths", 95);

        Teach.Equal(2, book.Count, "Two students.");
        Teach.Equal(2, book["ada"].Count,
            "ada has two subjects - recording maths twice replaced the score, it did not add a "
                + "row - reread README ex7.");
        Teach.Equal(95, Gradebook.ScoreOf(book, "ada", "maths"), "The later maths score won...");
        Teach.Equal(70, Gradebook.ScoreOf(book, "ada", "music"), "...without touching music.");

        Teach.True(Gradebook.ScoreOf(book, "zed", "maths") is null,
            "An unknown STUDENT is null - the outer lookup misses - reread README ex7.");
        Teach.True(Gradebook.ScoreOf(book, "ada", "art") is null,
            "...and so is an unknown SUBJECT for a known student: two lookups, either can miss, "
                + "and neither may throw.");

        Teach.Equal(87.5, Gradebook.SubjectAverage(book, "maths"),
            "(95 + 80) / 2. Average over exactly the students who HAVE a maths score - ada's "
                + "music must not sneak in - reread README ex7.");
        Teach.Equal(70.0, Gradebook.SubjectAverage(book, "music"), "One score averages to itself.");

        Teach.Throws<InvalidOperationException>(() => Gradebook.SubjectAverage(book, "art"),
            "Nobody sat art: the average of nothing does not exist, and Average over an empty "
                + "sequence says so by throwing - reread README ex7.");
    }

    [Fact]
    public void Ex8_TwoNumbersThatSumToATarget()
    {
        Teach.Equal((1, 3), PairFinder.FirstPairSummingTo(new[] { 2, 7, 11, 4, 9 }, 11),
            "7 (position 1) + 4 (position 3). Walk once and, for each number, ask the dictionary "
                + "whether its COMPLEMENT (target minus it) has been seen - reread README ex8.");

        Teach.Equal((0, 1), PairFinder.FirstPairSummingTo(new[] { 3, 3, 3 }, 6),
            "The pair is two DIFFERENT positions of the same value, and the first two win. If "
                + "you stored with Add you threw on the duplicate 3 - reread README ex8.");

        Teach.Equal((0, 3), PairFinder.FirstPairSummingTo(new[] { 1, 4, 1, 5 }, 6),
            "The FIRST 1 partners the 5: keep the EARLIEST position for each value, so the "
                + "stored 1 is position 0, not position 2 - reread README ex8.");

        Teach.Equal((1, 2), PairFinder.FirstPairSummingTo(new[] { 5, -3, 9, 1 }, 6),
            "-3 + 9: negatives are just numbers to a dictionary.");

        Teach.True(PairFinder.FirstPairSummingTo(new[] { 1, 2, 3 }, 100) is null,
            "No pair, no answer.");
        Teach.True(PairFinder.FirstPairSummingTo(new[] { 5 }, 10) is null,
            "One 5 is not a pair: the same POSITION cannot be used twice, which is why the "
                + "lookup happens before the store - reread README ex8.");

        Teach.True(PairFinder.HasPairSummingTo(new[] { 8, 2 }, 10), "The question form says yes...");
        Teach.True(!PairFinder.HasPairSummingTo(new[] { 8, 2 }, 11), "...and no.");
    }
}
