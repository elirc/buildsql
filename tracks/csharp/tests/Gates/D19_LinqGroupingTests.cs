using CSharpDojo.D19_LinqGrouping;

namespace CSharpDojo.Gates;

public class D19_LinqGroupingTests
{
    [Fact]
    public void Ex1_TheFirstGrouping()
    {
        string[] words = { "ada", "alan", "bob", "grace", "gene", "cleo" };

        Dictionary<char, List<string>> byLetter = Tally.ByFirstLetter(words);
        Teach.Equal(4, byLetter.Count,
            "Four distinct first letters, so four groups - GroupBy makes one group per distinct "
                + "key, not one per item - reread README ex1.");
        Teach.Equal("ada,alan", string.Join(",", byLetter['a']),
            "The words inside a group keep the order they arrived in - reread README ex1.");
        Teach.Equal("grace,gene", string.Join(",", byLetter['g']), "...including this one.");
        Teach.Equal("bob", string.Join(",", byLetter['b']), "A group of one is still a group.");
        Teach.True(!byLetter.ContainsKey('z'),
            "A letter nothing starts with produces no group at all - GroupBy never invents empty "
                + "groups, which is the single most useful thing to know about it - reread "
                + "README ex1.");

        Teach.Equal("3:2|4:3|5:1", string.Join("|", Tally.CountByLength(words)),
            "Two words of length 3, three of length 4, one of length 5, ordered by length. The "
                + "group's Key is the length and Count() is how many landed in it - reread "
                + "README ex1.");

        Teach.Equal(0, Tally.ByFirstLetter(Array.Empty<string>()).Count,
            "No words, no groups - and an empty dictionary rather than null.");
        Teach.Equal(0, Tally.CountByLength(Array.Empty<string>()).Count, "...and an empty list.");
    }

    [Fact]
    public void Ex2_AggregatingInsideEachGroup()
    {
        Sale[] sales =
        {
            new Sale("north", "widget", 10),
            new Sale("north", "gizmo", 25),
            new Sale("south", "widget", 40),
            new Sale("south", "cog", 40),
            new Sale("east", "bolt", 5),
            new Sale("east", "nut", 30),
        };

        Teach.Equal("south=80|east=35|north=35", string.Join("|", Totals.UnitsByRegion(sales)),
            "Sum inside each group, then order the GROUPS by that sum descending. north and east "
                + "both total 35, and the ordinal tie-break puts east first - reread README ex2.");

        Dictionary<string, string> best = Totals.BestSellerByRegion(sales);
        Teach.Equal("gizmo", best["north"], "25 beats 10 - reread README ex2.");
        Teach.Equal("nut", best["east"], "30 beats 5.");
        Teach.Equal("cog", best["south"],
            "Both south sales are 40 units, so the ordinal tie-break on product name decides - "
                + "without it the answer depends on input order - reread README ex2.");
        Teach.Equal(3, best.Count, "One entry per region.");

        Dictionary<string, int> peak = Totals.PeakSaleByRegion(sales);
        Teach.Equal(25, peak["north"], "The largest SINGLE sale, not the total - reread README ex2.");
        Teach.Equal(40, peak["south"], "...and 40 here.");
        Teach.Equal(30, peak["east"], "...and 30 here.");

        Teach.Equal(0, Totals.UnitsByRegion(Array.Empty<Sale>()).Count, "No sales, no regions.");
        Teach.Equal(0, Totals.PeakSaleByRegion(Array.Empty<Sale>()).Count, "...and no entries.");
    }

    [Fact]
    public void Ex3_LookupsAndDictionariesAreNotTheSameThing()
    {
        Book[] books =
        {
            new Book("B1", "Dune", "herbert"),
            new Book("B2", "Emma", "austen"),
            new Book("B3", "Persuasion", "austen"),
            new Book("B4", "Sandworms", "herbert"),
        };

        ILookup<string, string> byAuthor = Indexing.TitlesByAuthor(books);
        Teach.Equal(2, byAuthor.Count, "Two authors.");
        Teach.Equal("Emma,Persuasion", string.Join(",", byAuthor["austen"]),
            "A lookup maps one key to MANY values, in input order - reread README ex3.");
        Teach.Equal("Dune,Sandworms", string.Join(",", byAuthor["herbert"]), "...and so does this one.");
        Teach.Equal(0, byAuthor["nobody"].Count(),
            "An unknown key gives an EMPTY sequence rather than throwing or returning null. That "
                + "is the one behaviour that makes a lookup nicer than a Dictionary of lists - "
                + "reread README ex3.");
        Teach.True(!byAuthor.Contains("nobody"), "...and Contains still says it is not there.");

        Dictionary<string, string> byId = Indexing.TitleById(books);
        Teach.Equal(4, byId.Count, "Four books, four ids.");
        Teach.Equal("Persuasion", byId["B3"], "One value per key - reread README ex3.");

        Book[] clashing =
        {
            new Book("B1", "Dune", "herbert"),
            new Book("B1", "Dune Messiah", "herbert"),
        };
        Teach.Throws<ArgumentException>(() => Indexing.TitleById(clashing),
            "ToDictionary throws on a duplicate key, and that is the right answer: an id that "
                + "repeats means the assumption behind the index is broken. Silently keeping the "
                + "last one is how a bug gets buried - reread README ex3.");

        Dictionary<string, int> counts = Indexing.BookCountByAuthor(books);
        Teach.Equal(2, counts["austen"], "Two each...");
        Teach.Equal(2, counts["herbert"], "...for both.");
        Teach.Throws<KeyNotFoundException>(() => { int ignored = counts["nobody"]; },
            "And a Dictionary DOES throw for a missing key - the opposite of the lookup above, "
                + "which is the comparison this exercise exists to make - reread README ex3.");
    }

    [Fact]
    public void Ex4_AKeyMadeOfTwoThings()
    {
        Visit[] visits =
        {
            new Visit("Mon", "A", "ada"),
            new Visit("Mon", "A", "bob"),
            new Visit("Mon", "B", "ada"),
            new Visit("Tue", "A", "cleo"),
            new Visit("Tue", "B", "bob"),
            new Visit("Tue", "B", "bob"),
        };

        Teach.Equal("Mon/A=2|Mon/B=1|Tue/A=1|Tue/B=2",
            string.Join("|", Schedules.CountByDayAndRoom(visits)),
            "The key is the PAIR, so Mon/A and Tue/A are different groups. A value tuple works "
                + "as a key because tuples compare by their parts - reread README ex4.");

        Teach.Equal("ada|bob", string.Join("|", Schedules.RoomHoppers(visits)),
            "ada was in A and B; bob was in A and B - his two Tue/B visits are one distinct room, "
                + "which is why the count has to be over DISTINCT rooms; cleo only ever saw A - "
                + "reread README ex4.");

        Visit[] settled = { new Visit("Mon", "A", "ada"), new Visit("Tue", "A", "ada") };
        Teach.Equal(0, Schedules.RoomHoppers(settled).Count,
            "Two visits on different days to the same room is not room-hopping - reread README ex4.");
        Teach.Equal("Mon/A=1|Tue/A=1", string.Join("|", Schedules.CountByDayAndRoom(settled)),
            "...but they are still two different day-and-room keys.");

        Teach.Equal(0, Schedules.CountByDayAndRoom(Array.Empty<Visit>()).Count, "Nothing in, nothing out.");
    }

    [Fact]
    public void Ex5_FoldingASequenceIntoOneValue()
    {
        Teach.Equal(5, Folds.TotalLength(new[] { "ab", "cde" }),
            "The seed is 0 and each step adds a length - reread README ex5.");
        Teach.Equal(0, Folds.TotalLength(Array.Empty<string>()),
            "The seeded overload returns the seed for an empty sequence rather than throwing, "
                + "which is exactly why it takes one - reread README ex5.");

        Teach.Equal("p/q/r", Folds.Deepest(new[] { "a/b", "x", "p/q/r", "s/t/u" }),
            "Two paths are three deep and the FIRST of them wins, because the comparison is "
                + "strictly greater-than - reread README ex5.");
        Teach.Equal("x", Folds.Deepest(new[] { "x" }), "One path is trivially the deepest.");
        Teach.Throws<InvalidOperationException>(() => Folds.Deepest(Array.Empty<string>()),
            "The seedless overload has nothing to start from, so an empty sequence is an error. "
                + "That is the difference between the two overloads - reread README ex5.");

        Summary summary = Folds.Summarise(new[] { 3, -1, 4, -1, 5 });
        Teach.Equal(5, summary.Count, "Five numbers...");
        Teach.Equal(-1, summary.Min, "...the smallest is -1...");
        Teach.Equal(5, summary.Max, "...the largest is 5...");
        Teach.Equal(10, summary.Sum,
            "...and they add up to 10 - all four gathered in ONE pass, which is the point of "
                + "folding rather than calling Min, Max, Sum and Count separately - reread "
                + "README ex5.");

        Summary single = Folds.Summarise(new[] { 7 });
        Teach.Equal(7, single.Min, "One number is its own minimum...");
        Teach.Equal(7, single.Max, "...and its own maximum.");

        Teach.Throws<InvalidOperationException>(() => Folds.Summarise(Array.Empty<int>()),
            "There is no minimum of nothing. The seed cannot answer this one, so the result "
                + "selector has to notice the count is still zero - reread README ex5.");
    }

    [Fact]
    public void Ex6_TheGroupByOverloadsThatSaveYouAStep()
    {
        Employee[] staff =
        {
            new Employee("ada", "eng", 5),
            new Employee("bob", "eng", 3),
            new Employee("cleo", "ops", 4),
            new Employee("dan", "eng", 2),
            new Employee("eve", "ops", 7),
        };

        Teach.Equal("eng:ada,bob,dan|ops:cleo,eve",
            string.Join("|", Shapes.NamesByDepartment(staff)),
            "With an element selector the group holds NAMES, so string.Join can be handed the "
                + "group directly - an IGrouping is itself an IEnumerable of its elements - "
                + "reread README ex6.");

        Teach.Equal("eng=3|ops=2", string.Join("|", Shapes.HeadcountByDepartment(staff)),
            "The result-selector overload hands your lambda the key and the members and lets you "
                + "return whatever you like, so no IGrouping object is ever created - reread "
                + "README ex6.");

        Teach.Equal("eng=5|ops=7", string.Join("|", Shapes.TopLevelByDepartment(staff)),
            "Max inside each group. eve outranks cleo in ops, and ada outranks the rest of eng - "
                + "reread README ex6.");

        Employee[] one = { new Employee("solo", "eng", 1) };
        Teach.Equal("eng:solo", string.Join("|", Shapes.NamesByDepartment(one)), "A department of one.");
        Teach.Equal("eng=1", string.Join("|", Shapes.HeadcountByDepartment(one)), "...counted as one.");

        Teach.Equal(0, Shapes.NamesByDepartment(Array.Empty<Employee>()).Count, "Nobody, no departments.");
    }

    [Fact]
    public void Ex7_TopNInsideEveryGroup()
    {
        Score[] scores =
        {
            new Score("ada", "chess", 10),
            new Score("bob", "chess", 8),
            new Score("cleo", "chess", 12),
            new Score("ada", "go", 5),
            new Score("bob", "go", 9),
            new Score("cleo", "go", 4),
            new Score("ada", "darts", 3),
            new Score("dan", "darts", 3),
        };

        Teach.Equal("chess:cleo,ada|darts:ada,dan|go:bob,ada",
            string.Join("|", Leaderboards.TopTwoPerGame(scores)),
            "Group by game, order INSIDE each group by points descending, then Take(2). The "
                + "ordering has to happen per group - sorting everything first and then grouping "
                + "gives the same answer here only by luck - reread README ex7.");

        Teach.Equal("ada", string.Join("|", Leaderboards.Consistent(scores)),
            "ada is in the top two of all three games; cleo, bob and dan each make it once. "
                + "Flattening the per-game top-twos and grouping THAT by player is the shape - "
                + "reread README ex7.");

        Score[] lonely = { new Score("solo", "chess", 1) };
        Teach.Equal("chess:solo", string.Join("|", Leaderboards.TopTwoPerGame(lonely)),
            "Take(2) over a group of one gives one - it does not pad, and it does not throw - "
                + "reread README ex7.");
        Teach.Equal(0, Leaderboards.Consistent(lonely).Count, "One game is not more than one.");

        Teach.Equal(0, Leaderboards.TopTwoPerGame(Array.Empty<Score>()).Count, "No scores, no games.");
    }

    [Fact]
    public void Ex8_AReportAndTheBucketsThatStayEmpty()
    {
        LogEntry[] logs =
        {
            new LogEntry("api", "error", 900),
            new LogEntry("api", "info", 50),
            new LogEntry("api", "error", 1200),
            new LogEntry("db", "error", 80),
            new LogEntry("db", "info", 30),
            new LogEntry("web", "info", 20),
            new LogEntry("web", "info", 5000),
            new LogEntry("cache", "error", 40),
        };

        Teach.Equal("api errors=2 slowest=1200|cache errors=1 slowest=40|db errors=1 slowest=80",
            string.Join("|", Analytics.ErrorReport(logs)),
            "Two aggregates per group with different filters: the error count uses Count with a "
                + "predicate, and slowest is the Max over ALL the service's entries. web logged "
                + "no errors, so it is not in the report at all, even though it owns the slowest "
                + "request of the lot - reread README ex8.");

        Teach.Equal("fast=5|normal=1|slow=2", string.Join("|", Analytics.LatencyHistogram(logs)),
            "50, 80, 30, 20 and 40 are fast; 900 is normal; 1200 and 5000 are slow - reread "
                + "README ex8.");

        LogEntry[] quick = { new LogEntry("api", "info", 5), new LogEntry("api", "info", 9) };
        Teach.Equal("fast=2|normal=0|slow=0", string.Join("|", Analytics.LatencyHistogram(quick)),
            "Two buckets are empty, and they must still be reported as zero. GroupBy cannot do "
                + "this on its own - it only ever produces a group for a key something landed "
                + "in, so the three bucket names have to come from you - reread README ex8.");
        Teach.Equal(0, Analytics.ErrorReport(quick).Count, "No errors, no report lines.");

        Teach.Equal("fast=0|normal=0|slow=0",
            string.Join("|", Analytics.LatencyHistogram(Array.Empty<LogEntry>())),
            "...and with no logs at all the shape of the histogram is still the same three "
                + "buckets - reread README ex8.");

        LogEntry[] edges =
        {
            new LogEntry("s", "info", 99),
            new LogEntry("s", "info", 100),
            new LogEntry("s", "info", 999),
            new LogEntry("s", "info", 1000),
        };
        Teach.Equal("fast=1|normal=2|slow=1", string.Join("|", Analytics.LatencyHistogram(edges)),
            "The boundaries are exclusive at the bottom of each band: 100 is normal, not fast, "
                + "and 1000 is slow, not normal - reread README ex8.");
    }
}
