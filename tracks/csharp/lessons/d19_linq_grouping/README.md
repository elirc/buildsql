# d19 - LINQ grouping drills

Eight problems on `GroupBy` and the things that live next to it: aggregating
inside a group, `ToLookup` versus `ToDictionary`, composite keys, `Aggregate`,
the `GroupBy` overloads nobody reads, top-N per group, and the buckets that
have to be reported even when nothing landed in them. They drill lesson 11 -
reread `11_linq_2` if `IGrouping<TKey, TElement>` is still an unfamiliar shape.

Every file lives in `src/Lessons/D19_LinqGrouping/`. Nothing here depends on
anything else here.

## Exercise 1 - the first grouping

`Tally.ByFirstLetter(words)` returns a `Dictionary<char, List<string>>` with
the words that share a first character, each group in input order.
`Tally.CountByLength(words)` returns `"3:2"` entries - length and count -
ordered by length ascending.

Edit `src/Lessons/D19_LinqGrouping/Ex1.cs`.

```
uv run dojo test csharp d19_linq_grouping ex1
```

## Exercise 2 - aggregating inside each group

`Totals.UnitsByRegion(sales)` returns `"region=total"` ordered by total
descending, ties broken by region name (ordinal).
`Totals.BestSellerByRegion(sales)` maps each region to the product of its
largest single sale, ties broken by product name (ordinal).
`Totals.PeakSaleByRegion(sales)` maps each region to that largest number of
units.

Edit `src/Lessons/D19_LinqGrouping/Ex2.cs`.

```
uv run dojo test csharp d19_linq_grouping ex2
```

## Exercise 3 - lookups and dictionaries are not the same thing

`Indexing.TitlesByAuthor(books)` returns an `ILookup<string, string>` - one
author, many titles - where an unknown key gives an empty sequence.
`Indexing.TitleById(books)` returns a `Dictionary<string, string>` and lets the
duplicate-key exception through. `Indexing.BookCountByAuthor(books)` counts
per author.

Edit `src/Lessons/D19_LinqGrouping/Ex3.cs`.

```
uv run dojo test csharp d19_linq_grouping ex3
```

## Exercise 4 - a key made of two things

`Schedules.CountByDayAndRoom(visits)` returns `"Mon/A=2"` for every day-and-room
pair with any visits, ordered by day then room (both ordinal).
`Schedules.RoomHoppers(visits)` returns the people seen in more than one
*distinct* room, ordered by name.

Edit `src/Lessons/D19_LinqGrouping/Ex4.cs`.

```
uv run dojo test csharp d19_linq_grouping ex4
```

## Exercise 5 - folding a sequence into one value

Three `Aggregate` overloads, one each. `Folds.TotalLength(parts)` uses the
seeded form and returns 0 for an empty sequence. `Folds.Deepest(paths)` uses
the seedless form - the path with the most `/`, first one winning a tie - and
throws `InvalidOperationException` when there is nothing. `Folds.Summarise`
uses the seed-and-result-selector form to gather count, min, max and sum in one
pass, throwing for an empty sequence.

Edit `src/Lessons/D19_LinqGrouping/Ex5.cs`.

```
uv run dojo test csharp d19_linq_grouping ex5
```

## Exercise 6 - the GroupBy overloads that save you a step

`Shapes.NamesByDepartment(staff)` gives `"eng:ada,bob"` using the element-selector
overload, so each group holds names. `Shapes.HeadcountByDepartment(staff)` gives
`"eng=2"` using the result-selector overload, so no group object is created.
`Shapes.TopLevelByDepartment(staff)` gives `"eng=5"`. All three are ordered by
department (ordinal).

Edit `src/Lessons/D19_LinqGrouping/Ex6.cs`.

```
uv run dojo test csharp d19_linq_grouping ex6
```

## Exercise 7 - top N inside every group

`Leaderboards.TopTwoPerGame(scores)` gives `"chess:cleo,ada"` for each game,
games ordered ordinal, naming the two highest scorers with ties broken by
player name. A game with one player names one.
`Leaderboards.Consistent(scores)` returns the players who are in the top two of
more than one game, ordered by name.

Edit `src/Lessons/D19_LinqGrouping/Ex7.cs`.

```
uv run dojo test csharp d19_linq_grouping ex7
```

## Exercise 8 - a report, and the buckets that stay empty

`Analytics.ErrorReport(logs)` gives one line per service that logged at least
one `"error"`: `"api errors=2 slowest=1200"`, where slowest is the largest
`Millis` over *all* that service's entries. Ordered by error count descending,
ties broken by service name. `Analytics.LatencyHistogram(logs)` always returns
exactly `"fast=..."`, `"normal=..."`, `"slow=..."` in that order - fast is under
100ms, normal under 1000ms, slow is 1000ms or more - including buckets with a
count of zero.

Edit `src/Lessons/D19_LinqGrouping/Ex8.cs`.

```
uv run dojo test csharp d19_linq_grouping ex8
```

## The gate

This is the entire gate class, `tests/Gates/D19_LinqGroupingTests.cs`:

```csharp
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
```
