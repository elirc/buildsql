# d18 - LINQ filtering drills

Eight problems on the operators that make a sequence smaller or pick one thing
out of it: `Where`, `Any`/`All`/`Count`, the `First`/`Single` family, `Skip`,
`Take`, `TakeWhile`, `SkipWhile`, `Distinct`, `OfType` and the ordering that
goes with them. They drill lesson 10 - reread `10_linq_1` if the difference
between `First` and `Single` is still a shrug.

Every file lives in `src/Lessons/D18_LinqFiltering/`. Nothing here depends on
anything else here.

## Exercise 1 - restrict, then project

`Restrict.LongWordsUpper(words, minLength)` keeps the words at least
`minLength` characters long, upper-cases them with `ToUpperInvariant`, and
preserves the input order. `Restrict.Numbered(words)` turns each word into
`"1. ada"` with a 1-based position.

Edit `src/Lessons/D18_LinqFiltering/Ex1.cs`.

```
uv run dojo test csharp d18_linq_filtering ex1
```

## Exercise 2 - questions with a yes-or-no answer

`Questions.AnyNegative`, `Questions.AllPositive`, `Questions.HasAny` and
`Questions.CountBetween(numbers, low, high)` - the last one counting the
numbers in an inclusive range. Work out what each of the first three should say
about an empty sequence before you write them; the gate checks all three.

Edit `src/Lessons/D18_LinqFiltering/Ex2.cs`.

```
uv run dojo test csharp d18_linq_filtering ex2
```

## Exercise 3 - picking one element

Four ways to ask for the word starting with a given letter.
`Picks.FirstStartingWith` throws `InvalidOperationException` when there is
none; `Picks.FirstStartingWithOrNull` returns null instead;
`Picks.OnlyStartingWith` throws when there is none *and* when there is more
than one; `Picks.FirstStartingWithOr(words, letter, fallback)` returns the
fallback.

Edit `src/Lessons/D18_LinqFiltering/Ex3.cs`.

```
uv run dojo test csharp d18_linq_filtering ex3
```

## Exercise 4 - slicing by position and by a running condition

`Slices.Page(source, pageNumber, pageSize)` returns one 1-based page; a page
past the end is empty. `Slices.WithinBudget(costs, budget)` returns the longest
run of costs from the front whose *running total* stays at or below the budget,
stopping at the first one that breaks it. `Slices.AfterFirstNegative(numbers)`
returns everything after the first negative number, dropping the negative
itself, and is empty when there is no negative.

Edit `src/Lessons/D18_LinqFiltering/Ex4.cs`.

```
uv run dojo test csharp d18_linq_filtering ex4
```

## Exercise 5 - duplicates, and a stable order

`Dedupe.UniqueOwners(tickets)` gives each owner once in first-seen order.
`Dedupe.OnePerOwner(tickets)` keeps one whole ticket per owner - the first one.
`Dedupe.Ranked(tickets)` orders by `Priority` ascending with ties broken by
`Id` using `StringComparer.Ordinal`. None of them may modify the input.

Edit `src/Lessons/D18_LinqFiltering/Ex5.cs`.

```
uv run dojo test csharp d18_linq_filtering ex5
```

## Exercise 6 - filtering by type, and filtering out nothing

`Narrow.IntsOnly(items)` keeps the items that really are `int`.
`Narrow.Meaningful(entries)` drops null, empty and whitespace-only entries and
trims what is left. `Narrow.Describe(items)` produces one description per item:
`"int:7"`, `"text:hi"`, `"null"`, or `"other:Double"` using the runtime type's
name.

Edit `src/Lessons/D18_LinqFiltering/Ex6.cs`.

```
uv run dojo test csharp d18_linq_filtering ex6
```

## Exercise 7 - several filters, an ordering and a limit

`Reports.TopProducts(sales, allowedRegions, minRevenue, count)` keeps the sales
whose `Region` is in the allow-list and whose revenue (`Units * UnitPrice`) is
at least `minRevenue`, orders them by revenue descending with ties broken by
`Product` ordinal-ascending, cuts the result to at most `count` entries, and
returns the product names.

Edit `src/Lessons/D18_LinqFiltering/Ex7.cs`.

```
uv run dojo test csharp d18_linq_filtering ex7
```

## Exercise 8 - optional filters, one page, and the total behind it

`Library.Search(books, author, fromYear, maxPrice, pageNumber, pageSize)`
applies only the criteria that were supplied - a null one means "do not filter
on that" - orders by `Year` ascending with ties broken by `Title` (ordinal),
and returns a `SearchResult` holding one 1-based page and the number of books
that matched *before* the paging. The gate also checks that the source sequence
is enumerated exactly once.

Edit `src/Lessons/D18_LinqFiltering/Ex8.cs`.

```
uv run dojo test csharp d18_linq_filtering ex8
```

## The gate

This is the entire gate class, `tests/Gates/D18_LinqFilteringTests.cs`:

```csharp
using CSharpDojo.D18_LinqFiltering;

namespace CSharpDojo.Gates;

public class D18_LinqFilteringTests
{
    [Fact]
    public void Ex1_RestrictThenProject()
    {
        string[] words = { "ada", "grace", "hopper", "bob", "lovelace" };

        Teach.Equal("GRACE|HOPPER|LOVELACE",
            string.Join("|", Restrict.LongWordsUpper(words, 5)),
            "Where keeps the words of at least five characters and Select upper-cases what "
                + "survives - and the input order is untouched, because neither operator sorts "
                + "anything - reread README ex1.");

        Teach.Equal("ADA|GRACE|HOPPER|BOB|LOVELACE",
            string.Join("|", Restrict.LongWordsUpper(words, 0)),
            "A minimum of zero keeps everything.");
        Teach.Equal(0, Restrict.LongWordsUpper(words, 99).Count,
            "...and a minimum nothing reaches gives an empty list, not null.");
        Teach.Equal(0, Restrict.LongWordsUpper(Array.Empty<string>(), 3).Count,
            "An empty input gives an empty output rather than throwing.");

        Teach.Equal("1. ada|2. grace|3. hopper",
            string.Join("|", Restrict.Numbered(new[] { "ada", "grace", "hopper" })),
            "Select has an overload whose lambda takes the index as a second parameter, which "
                + "saves keeping a counter of your own. Positions are 1-based here, so the index "
                + "needs a +1 - reread README ex1.");
        Teach.Equal(0, Restrict.Numbered(Array.Empty<string>()).Count, "Nothing in, nothing out.");
    }

    [Fact]
    public void Ex2_QuestionsWithAYesOrNoAnswer()
    {
        int[] mixed = { 3, -1, 4 };
        int[] positive = { 3, 1, 4 };
        int[] empty = Array.Empty<int>();

        Teach.True(Questions.AnyNegative(mixed), "There is a -1 in there.");
        Teach.True(!Questions.AnyNegative(positive), "...and none in there.");
        Teach.True(!Questions.AnyNegative(empty),
            "Any over an empty sequence is FALSE: there is no element that satisfies it - "
                + "reread README ex2.");

        Teach.True(Questions.AllPositive(positive), "Every one of them is above zero.");
        Teach.True(!Questions.AllPositive(mixed), "The -1 spoils it.");
        Teach.True(Questions.AllPositive(empty),
            "All over an empty sequence is TRUE - vacuously, because there is no element that "
                + "breaks the rule. That asymmetry with Any is the single most surprising thing "
                + "in this exercise, and it is the same rule maths uses - reread README ex2.");

        Teach.True(Questions.HasAny(positive), "A parameterless Any just asks whether there is "
            + "anything at all.");
        Teach.True(!Questions.HasAny(empty),
            "...and says no for an empty sequence. Prefer it to Count() != 0, which walks the "
                + "whole sequence to answer a question the first element settles - reread "
                + "README ex2.");

        Teach.Equal(3, Questions.CountBetween(new[] { 1, 5, 10, 15, 20 }, 5, 15),
            "Both ends are included, so 5, 10 and 15 all count - reread README ex2.");
        Teach.Equal(0, Questions.CountBetween(new[] { 1, 2 }, 5, 15), "Nothing in range.");
        Teach.Equal(0, Questions.CountBetween(empty, 0, 100), "Nothing at all.");
        Teach.Equal(1, Questions.CountBetween(new[] { 7 }, 7, 7),
            "A range with one value in it still includes that value.");
    }

    [Fact]
    public void Ex3_PickingOneElement()
    {
        string[] words = { "ada", "grace", "alan", "bob" };

        Teach.Equal("ada", Picks.FirstStartingWith(words, 'a'),
            "First takes the first match and stops looking - reread README ex3.");
        Teach.Throws<InvalidOperationException>(() => Picks.FirstStartingWith(words, 'z'),
            "First with nothing to return throws InvalidOperationException. It does NOT return "
                + "null - for a sequence of ints there would be no null to return, which is why "
                + "the two overloads exist - reread README ex3.");

        Teach.Equal("ada", Picks.FirstStartingWithOrNull(words, 'a'),
            "FirstOrDefault finds the same first match as First - it differs only in what it "
                + "does when there is none.");
        Teach.True(Picks.FirstStartingWithOrNull(words, 'z') is null,
            "...and hands back the default for the type - null for a string - instead of "
                + "throwing - reread README ex3.");

        Teach.Equal("grace", Picks.OnlyStartingWith(words, 'g'),
            "Single returns the one match - reread README ex3.");
        Teach.Throws<InvalidOperationException>(() => Picks.OnlyStartingWith(words, 'a'),
            "Two words start with 'a', and Single treats that as a broken assumption rather than "
                + "quietly picking one. That is the whole reason to use it instead of First - "
                + "reread README ex3.");
        Teach.Throws<InvalidOperationException>(() => Picks.OnlyStartingWith(words, 'z'),
            "...and no match at all is equally broken.");

        Teach.Equal("bob", Picks.FirstStartingWithOr(words, 'b', "none"), "A match wins.");
        Teach.Equal("none", Picks.FirstStartingWithOr(words, 'z', "none"),
            "FirstOrDefault takes a second argument for the fallback, so you do not need a null "
                + "check afterwards - reread README ex3.");
    }

    [Fact]
    public void Ex4_SlicingByPositionAndByARunningCondition()
    {
        int[] source = { 10, 20, 30, 40, 50, 60, 70 };

        Teach.Equal("10|20|30", string.Join("|", Slices.Page(source, 1, 3)),
            "Page 1 is the first three. Skip((1-1)*3) skips nothing - getting page 1 to skip "
                + "three items is the classic off-by-one here - reread README ex4.");
        Teach.Equal("40|50|60", string.Join("|", Slices.Page(source, 2, 3)), "Page 2 is the next three.");
        Teach.Equal("70", string.Join("|", Slices.Page(source, 3, 3)),
            "The last page is short, and Take copes with that on its own.");
        Teach.Equal(0, Slices.Page(source, 4, 3).Count,
            "A page past the end is empty rather than an error - Skip past the end just yields "
                + "nothing - reread README ex4.");

        Teach.Equal("3|4|5", string.Join("|", Slices.WithinBudget(new[] { 3, 4, 5, 1 }, 12)),
            "3, 7 and 12 all stay within 12, and the running total is what decides - reread "
                + "README ex4.");
        Teach.Equal("3", string.Join("|", Slices.WithinBudget(new[] { 3, 4, 5, 1 }, 6)),
            "3 fits, 7 does not, and TakeWhile stops at the first failure - it does not carry on "
                + "looking for smaller items that would fit, which is exactly the difference "
                + "between TakeWhile and Where - reread README ex4.");
        Teach.Equal(0, Slices.WithinBudget(new[] { 3, 4 }, 2).Count, "The very first item breaks it.");
        Teach.Equal("3|4", string.Join("|", Slices.WithinBudget(new[] { 3, 4 }, 100)),
            "A budget nothing exceeds keeps everything.");

        Teach.Equal("3|-1|4", string.Join("|", Slices.AfterFirstNegative(new[] { 1, 2, -5, 3, -1, 4 })),
            "SkipWhile drops the leading non-negatives and STOPS testing once it has, so the "
                + "later -1 survives; the extra Skip(1) drops the -5 that ended the run - reread "
                + "README ex4.");
        Teach.Equal(0, Slices.AfterFirstNegative(new[] { 1, 2, 3 }).Count,
            "With no negative at all SkipWhile consumes everything and there is nothing left - "
                + "reread README ex4.");
        Teach.Equal("1|2", string.Join("|", Slices.AfterFirstNegative(new[] { -9, 1, 2 })),
            "A negative in first position is still the first negative.");
        Teach.Equal(0, Slices.AfterFirstNegative(new[] { -9 }).Count, "...and may be the only item.");
    }

    [Fact]
    public void Ex5_DuplicatesAndAStableOrder()
    {
        Ticket[] tickets =
        {
            new Ticket("T3", "ada", 2),
            new Ticket("T1", "bob", 1),
            new Ticket("T2", "ada", 1),
            new Ticket("T4", "cleo", 2),
            new Ticket("T5", "bob", 3),
        };

        Teach.Equal("ada|bob|cleo", string.Join("|", Dedupe.UniqueOwners(tickets)),
            "Distinct keeps the FIRST occurrence of each value and preserves that order - it "
                + "does not sort, however much the result here looks sorted - reread README ex5.");

        Teach.Equal("T3|T1|T4", string.Join("|", Dedupe.OnePerOwner(tickets).Select(t => t.Id)),
            "DistinctBy compares the key and keeps the whole first item that had it, so ada's "
                + "T3 survives and her T2 does not - reread README ex5.");

        Teach.Equal("T1|T2|T3|T4|T5", string.Join("|", Dedupe.Ranked(tickets).Select(t => t.Id)),
            "Priority 1 first (T1 then T2 by Id), then priority 2 (T3, T4), then T5 - reread "
                + "README ex5.");
        Teach.Equal("1|1|2|2|3", string.Join("|", Dedupe.Ranked(tickets).Select(t => t.Priority)),
            "...and the priorities really do come out ascending.");

        Ticket[] tied = { new Ticket("B", "x", 1), new Ticket("A", "y", 1) };
        Teach.Equal("A|B", string.Join("|", Dedupe.Ranked(tied).Select(t => t.Id)),
            "With equal priorities the ThenBy on Id decides. Note that OrderBy alone would have "
                + "left these in input order, because LINQ's sort is stable - the ThenBy is what "
                + "makes the tie-break a promise rather than an accident - reread README ex5.");

        Teach.Equal(5, tickets.Length,
            "None of the three methods may modify the input - they all return new sequences.");
    }

    [Fact]
    public void Ex6_FilteringByTypeAndFilteringOutNothing()
    {
        object?[] items = { 1, "two", 3, null, 4.5, "six", 7 };

        Teach.Equal("1|3|7", string.Join("|", Narrow.IntsOnly(items)),
            "OfType<int> keeps the items that really are ints and silently drops everything "
                + "else, including the null and the double. Cast<int> would have thrown on the "
                + "first string - that is the difference between the two - reread README ex6.");
        Teach.Equal(0, Narrow.IntsOnly(new object?[] { "a", null }).Count, "Nothing of that type.");

        string?[] entries = { "  ada  ", null, "", "   ", "bob" };
        Teach.Equal("ada|bob", string.Join("|", Narrow.Meaningful(entries)),
            "string.IsNullOrWhiteSpace covers null, empty and all-spaces in one call, and the "
                + "survivors are trimmed - reread README ex6.");
        Teach.Equal(0, Narrow.Meaningful(new string?[] { null, " " }).Count,
            "...and nothing meaningful gives an empty list.");

        Teach.Equal("int:1|text:two|int:3|null|other:Double|text:six|int:7",
            string.Join("|", Narrow.Describe(items)),
            "A switch expression inside Select gives one description per item, in order. The "
                + "null arm has to come first: a type pattern like `int number` never matches "
                + "null, but reaching item.GetType() on a null would throw - reread README ex6.");
        Teach.Equal(items.Length, Narrow.Describe(items).Count,
            "Describe projects rather than filters, so the count is unchanged - reread README ex6.");
    }

    [Fact]
    public void Ex7_SeveralFiltersAnOrderingAndALimit()
    {
        Sale[] sales =
        {
            new Sale("north", "widget", 10, 5m),     // 50, allowed
            new Sale("south", "gadget", 100, 4m),    // 400, region not allowed
            new Sale("north", "gizmo", 3, 100m),     // 300, allowed
            new Sale("east", "doohickey", 2, 10m),   // 20, below the minimum
            new Sale("east", "sprocket", 30, 10m),   // 300, allowed
            new Sale("north", "cog", 1, 25m),        // 25, below the minimum
        };

        HashSet<string> allowed = new HashSet<string> { "north", "east" };

        Teach.Equal("gizmo|sprocket|widget",
            string.Join("|", Reports.TopProducts(sales, allowed, 50m, 10)),
            "Two filters, then the ordering: gizmo and sprocket both earned 300 and the ordinal "
                + "tie-break on Product puts gizmo first, then widget at 50. The south sale is "
                + "out on region and the two small ones on revenue - reread README ex7.");

        Teach.Equal("gizmo|sprocket",
            string.Join("|", Reports.TopProducts(sales, allowed, 50m, 2)),
            "Take comes last, after the ordering - taking first and then sorting gives an "
                + "arbitrary two - reread README ex7.");

        Teach.Equal(0, Reports.TopProducts(sales, allowed, 50m, 0).Count,
            "Take(0) is empty rather than an error.");

        Teach.Equal("gizmo|sprocket|widget|cog|doohickey",
            string.Join("|", Reports.TopProducts(sales, allowed, 0m, 10)),
            "With no revenue floor the two small sales reappear, at the bottom - reread README ex7.");

        Teach.Equal(0, Reports.TopProducts(sales, new HashSet<string>(), 0m, 10).Count,
            "An empty allow-list matches no region at all.");

        Teach.Equal("gadget",
            string.Join("|", Reports.TopProducts(sales, new HashSet<string> { "south" }, 0m, 10)),
            "...and a different allow-list picks out a different sale.");

        Teach.Equal(0, Reports.TopProducts(sales, allowed, 10000m, 10).Count,
            "A floor nothing clears gives an empty list, not null - reread README ex7.");
    }

    [Fact]
    public void Ex8_OptionalFiltersOnePageAndTheTotalBehindIt()
    {
        Book[] books =
        {
            new Book("Dune", "herbert", 1965, 9m),
            new Book("Emma", "austen", 1815, 5m),
            new Book("Neuromancer", "gibson", 1984, 12m),
            new Book("Persuasion", "austen", 1817, 6m),
            new Book("Sandworms", "herbert", 1985, 20m),
            new Book("Aurora", "austen", 1817, 30m),
        };

        SearchResult all = Library.Search(books, null, null, null, 1, 10);
        Teach.Equal(6, all.TotalMatches,
            "All three criteria were null, so nothing was filtered - a null means SKIP that "
                + "filter, not match nothing - reread README ex8.");
        Teach.Equal("Emma|Aurora|Persuasion|Dune|Neuromancer|Sandworms",
            string.Join("|", all.Page.Select(b => b.Title)),
            "Ordered by Year ascending, and the two 1817 books are separated by the ordinal "
                + "tie-break on Title - reread README ex8.");

        SearchResult austen = Library.Search(books, "austen", null, null, 1, 10);
        Teach.Equal(3, austen.TotalMatches, "Three books by that author.");
        Teach.Equal("Emma|Aurora|Persuasion", string.Join("|", austen.Page.Select(b => b.Title)),
            "...in the same Year-then-Title order.");

        SearchResult cheapAndRecent = Library.Search(books, null, 1900, 15m, 1, 10);
        Teach.Equal("Dune|Neuromancer", string.Join("|", cheapAndRecent.Page.Select(b => b.Title)),
            "Two criteria compose: from 1900 leaves Dune, Neuromancer and Sandworms, and 15 or "
                + "less then drops Sandworms at 20 - reread README ex8.");
        Teach.Equal(2, cheapAndRecent.TotalMatches, "...leaving two.");

        SearchResult firstPage = Library.Search(books, null, null, null, 1, 2);
        Teach.Equal("Emma|Aurora", string.Join("|", firstPage.Page.Select(b => b.Title)),
            "Page 1 of 2 - reread README ex8.");
        Teach.Equal(6, firstPage.TotalMatches,
            "TotalMatches counts everything that MATCHED, not what fitted on the page. Computing "
                + "it after the Skip/Take would make every page report 2 and the pager would have "
                + "nothing to work with - reread README ex8.");

        SearchResult secondPage = Library.Search(books, null, null, null, 2, 2);
        Teach.Equal("Persuasion|Dune", string.Join("|", secondPage.Page.Select(b => b.Title)),
            "Page 2 carries on where page 1 stopped.");
        Teach.Equal(6, secondPage.TotalMatches, "...and reports the same total.");

        SearchResult pastTheEnd = Library.Search(books, null, null, null, 9, 2);
        Teach.Equal(0, pastTheEnd.Page.Count, "A page past the end is empty...");
        Teach.Equal(6, pastTheEnd.TotalMatches, "...and still knows how many there were.");

        SearchResult nothing = Library.Search(books, "nobody", null, null, 1, 10);
        Teach.Equal(0, nothing.TotalMatches, "An author nobody wrote under matches nothing...");
        Teach.Equal(0, nothing.Page.Count, "...and the page is empty rather than null.");

        int enumerations = 0;
        IEnumerable<Book> counted = books.Select(book =>
        {
            enumerations++;
            return book;
        });
        Library.Search(counted, null, null, null, 1, 2);
        Teach.Equal(books.Length, enumerations,
            "The source was walked exactly once. Counting the matches with one query and then "
                + "paging with a second walks it twice - which is merely wasteful over an array "
                + "and wrong over anything you can only read once - reread README ex8.");
    }
}
```
