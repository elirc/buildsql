# d24 - Mixed gauntlet

The last drill set, and the cumulative one: every exercise combines two or
three things from across the track rather than practising one. Records with
queries, an interface behind a generic constraint, a hierarchy read by a
pattern, delegates in a dictionary, your own comparer inside an iterator, an
event over a collection, tasks that partly fail, and a small repository that
uses most of the rest. If a problem here feels like guessing, the drill set it
came from is named in its section.

Every file lives in `src/Lessons/D24_MixedGauntlet/`. Nothing here depends on
anything else here.

## Exercise 1 - records, a query and some formatting

*Draws on d10, d18 and d19.* `Roster.ByTeam(members)` returns
`"eng: ada(9), bob(4)"` for each team with at least one member scoring above
zero - teams ordered by name (ordinal), members by points descending with ties
broken by name. `Roster.Awarded(member, extra)` returns a copy with the extra
points added and leaves the original untouched.

Edit `src/Lessons/D24_MixedGauntlet/Ex1.cs`.

```
uv run dojo test csharp d24_mixed_gauntlet ex1
```

## Exercise 2 - an interface, a constraint and a dictionary

*Draws on d09, d12 and d13.* `Catalogue.Cheapest<T>(items)` and
`Catalogue.Total<T>(items)` work for any `T : IPriced` - the cheapest being the
first of any tie, and empty being an `InvalidOperationException` for one and
zero for the other. `Catalogue.PriceList(widgets)` maps name to price with the
*last* widget of a repeated name winning.

Edit `src/Lessons/D24_MixedGauntlet/Ex2.cs`.

```
uv run dojo test csharp d24_mixed_gauntlet ex2
```

## Exercise 3 - a hierarchy, a pattern and a guard

*Draws on d07, d08 and d22.* `Rect` and `Circle` derive from `Shape`, override
`Area()`, and reject a non-positive dimension in the constructor with
`ArgumentOutOfRangeException`. `Shapes.Describe(shape)` returns `"rect 6"` or
`"circle 12.57"` - the kind from a type pattern, the area rounded to two places
and written with the invariant culture - and `"shape ..."` for anything else.
`Shapes.TotalArea(shapes)` sums the areas and rounds once at the end.

Edit `src/Lessons/D24_MixedGauntlet/Ex3.cs`.

```
uv run dojo test csharp d24_mixed_gauntlet ex3
```

## Exercise 4 - delegates in a dictionary, with the errors named

*Draws on d16, d13 and d22.* `Commands.Register(name, handler)` stores a
handler and rejects a repeated name with `ArgumentException`, changing nothing.
`Commands.Names` lists them in registration order. `Commands.Run(name, arg)`
throws `KeyNotFoundException` for an unknown name, and wraps anything the
handler throws in an `InvalidOperationException` with the message
`"command failed: <name>"` and the original as its `InnerException`.

Edit `src/Lessons/D24_MixedGauntlet/Ex4.cs`.

```
uv run dojo test csharp d24_mixed_gauntlet ex4
```

## Exercise 5 - your own comparer, streamed through an iterator

*Draws on d11, d15 and d21.* `CaseInsensitive` implements
`IEqualityComparer<string>` using an ordinal, case-insensitive comparison, with
a hash code that agrees with it. `Streams.FirstOfEach(source, comparer)` yields
the first occurrence of each distinct item lazily - nothing is read until the
result is enumerated, and only as far as the caller asks.

Edit `src/Lessons/D24_MixedGauntlet/Ex5.cs`.

```
uv run dojo test csharp d24_mixed_gauntlet ex5
```

## Exercise 6 - an event, a collection and a query

*Draws on d17, d13 and d19.* `Basket.Add(item)` stores the item and then raises
`Added`; a null or empty item is an `ArgumentException` that neither stores nor
announces anything. `Basket.Duplicates()` names the items appearing more than
once, in first-seen order. `Basket.Tally()` returns `"apple=3"` per distinct
item, ordered by count descending with ties broken ordinally.

Edit `src/Lessons/D24_MixedGauntlet/Ex6.cs`.

```
uv run dojo test csharp d24_mixed_gauntlet ex6
```

## Exercise 7 - many tasks, some of them broken

*Draws on d23, d18 and d22.* `Fetching.GatherAsync(tasks)` waits for all of
them and returns an `Outcome` holding the results that worked and the messages
of the ones that did not, both in task order.
`Fetching.LookupAsync(ids, fetch)` starts every fetch before waiting for any,
and returns `"id=result"` for the successful ones ordered by id (ordinal).

Edit `src/Lessons/D24_MixedGauntlet/Ex7.cs`.

```
uv run dojo test csharp d24_mixed_gauntlet ex7
```

## Exercise 8 - a small repository that uses most of the track

*Draws on d13, d17, d19 and d22.* `Repository.Save(employee)` adds or replaces
by `Id` without changing the insertion position, then raises `Saved`.
`Get(id)` throws `KeyNotFoundException` when there is none. `Remove(id)`
reports whether there was one. `Query(predicate)` returns the matches in
insertion order, and `DeptTotals()` returns `"eng=170"` per department, ordered
by department (ordinal), formatted with the invariant culture.

Edit `src/Lessons/D24_MixedGauntlet/Ex8.cs`.

```
uv run dojo test csharp d24_mixed_gauntlet ex8
```

## The gate

This is the entire gate class, `tests/Gates/D24_MixedGauntletTests.cs`:

```csharp
using System.Collections;

using CSharpDojo.D24_MixedGauntlet;

namespace CSharpDojo.Gates;

public class D24_MixedGauntletTests
{
    private sealed record Ticket(decimal Price) : IPriced;

    private sealed class Blob : Shape
    {
        public override double Area()
        {
            return 1.0;
        }
    }

    private sealed class Counting : IEnumerable<string>
    {
        private readonly string[] _items;

        public Counting(params string[] items)
        {
            _items = items;
        }

        public int Reads { get; private set; }

        public IEnumerator<string> GetEnumerator()
        {
            return Walk().GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        private IEnumerable<string> Walk()
        {
            foreach (string item in _items)
            {
                Reads++;
                yield return item;
            }
        }
    }

    [Fact]
    public void Ex1_RecordsAQueryAndSomeFormatting()
    {
        Member[] members =
        {
            new Member("ada", "eng", 9),
            new Member("bob", "eng", 4),
            new Member("cleo", "ops", 7),
            new Member("dan", "eng", 0),
            new Member("eve", "ops", 7),
            new Member("fred", "sales", -2),
        };

        Teach.Equal("eng: ada(9), bob(4)|ops: cleo(7), eve(7)",
            string.Join("|", Roster.ByTeam(members)),
            "Filter first, then group, then order the teams, then order inside each team - and "
                + "cleo and eve tie on 7, so the ordinal tie-break on name decides - reread "
                + "README ex1.");

        Teach.Equal(2, Roster.ByTeam(members).Count,
            "sales has one member and he scored below zero, so after the filter the team has "
                + "nobody in it - and GroupBy never produces a group for a key nothing reached, "
                + "so the team vanishes entirely - reread README ex1.");

        Member ada = members[0];
        Member promoted = Roster.Awarded(ada, 3);
        Teach.Equal(12, promoted.Points, "Nine plus three - reread README ex1.");
        Teach.Equal("ada", promoted.Name, "...and everything else came along unchanged.");
        Teach.Equal(9, ada.Points,
            "`with` produces a COPY. The original record is untouched, which is the whole reason "
                + "to reach for one - reread README ex1.");
        Teach.True(Roster.Awarded(ada, 0) == ada,
            "A copy with nothing changed is EQUAL to the original, because records compare by "
                + "value - reread README ex1.");
        Teach.True(!ReferenceEquals(Roster.Awarded(ada, 0), ada), "...while still being a new object.");

        Teach.Equal(0, Roster.ByTeam(Array.Empty<Member>()).Count, "Nobody, no teams.");
    }

    [Fact]
    public void Ex2_AnInterfaceAConstraintAndADictionary()
    {
        Widget[] widgets =
        {
            new Widget("bolt", 2.5m),
            new Widget("nut", 1.0m),
            new Widget("cog", 1.0m),
            new Widget("bolt", 3.0m),
        };

        Teach.Equal("nut", Catalogue.Cheapest(widgets).Name,
            "nut and cog both cost 1.0, and the FIRST of a tie wins - which needs a strict "
                + "less-than - reread README ex2.");
        Teach.Equal(7.5m, Catalogue.Total(widgets), "2.5 + 1.0 + 1.0 + 3.0 - reread README ex2.");

        Teach.Throws<InvalidOperationException>(() => Catalogue.Cheapest(Array.Empty<Widget>()),
            "There is no cheapest of nothing - reread README ex2.");
        Teach.Equal(0m, Catalogue.Total(Array.Empty<Widget>()),
            "...but an empty total is zero rather than an error - Sum says so - reread README ex2.");

        Ticket[] tickets = { new Ticket(9m), new Ticket(4m) };
        Teach.Equal(4m, Catalogue.Cheapest(tickets).Price,
            "The constraint is on the INTERFACE, so the same method works for any priced type "
                + "without knowing anything else about it - reread README ex2.");
        Teach.Equal(13m, Catalogue.Total(tickets), "...and so does the total.");

        Dictionary<string, decimal> prices = Catalogue.PriceList(widgets);
        Teach.Equal(3, prices.Count,
            "Three distinct names - reread README ex2.");
        Teach.Equal(3.0m, prices["bolt"],
            "\"bolt\" appears twice and the LAST one wins. ToDictionary would have thrown here, "
                + "and the indexer is what says the overwrite was intended - reread README ex2.");
        Teach.Equal(1.0m, prices["nut"], "...and the others are as expected.");
    }

    [Fact]
    public void Ex3_AHierarchyAPatternAndAGuard()
    {
        Teach.Equal("rect 6", Shapes.Describe(new Rect(2, 3)),
            "Two by three is six, and Math.Round leaves a whole number looking whole - reread "
                + "README ex3.");
        Teach.Equal("circle 12.57", Shapes.Describe(new Circle(2)),
            "Pi times four is 12.566..., rounded to two places. Formatting with the invariant "
                + "culture is what stops this test failing on a machine whose decimal separator "
                + "is a comma - reread README ex3.");
        Teach.Equal("shape 1", Shapes.Describe(new Blob()),
            "A shape the switch has never heard of still gets an answer, because the discard arm "
                + "is there - a pattern switch over a hierarchy you do not control needs one - "
                + "reread README ex3.");

        Teach.Throws<ArgumentOutOfRangeException>(() => new Rect(0, 3),
            "A rectangle with no width is not a rectangle, and the constructor is where that is "
                + "settled - reread README ex3.");
        Teach.Throws<ArgumentOutOfRangeException>(() => new Rect(2, -1), "...both dimensions.");
        Teach.Throws<ArgumentOutOfRangeException>(() => new Circle(0),
            "...and a circle needs a positive radius - reread README ex3.");

        Teach.Equal(9.14, Shapes.TotalArea(new Shape[] { new Rect(2, 3), new Circle(1) }),
            "Six plus pi, rounded once at the end - reread README ex3.");
        Teach.Equal(0.0, Shapes.TotalArea(Array.Empty<Shape>()),
            "No shapes, no area - and Sum handles that on its own.");

        Shape asBase = new Circle(2);
        Teach.Equal("circle 12.57", Shapes.Describe(asBase),
            "Through a Shape-typed reference the answer is the same: the type pattern tests the "
                + "RUNTIME type - reread README ex3.");
    }

    [Fact]
    public void Ex4_DelegatesInADictionaryWithTheErrorsNamed()
    {
        Commands commands = new Commands();
        commands.Register("upper", text => text.ToUpperInvariant());
        commands.Register("len", text => text.Length.ToString());
        commands.Register("boom", text => throw new FormatException("bad input"));

        Teach.Equal("HI", commands.Run("upper", "hi"), "The handler stored under that name ran.");
        Teach.Equal("3", commands.Run("len", "abc"), "...and so did the other one.");
        Teach.Equal("upper|len|boom", string.Join("|", commands.Names),
            "The names come back in registration order, which a Dictionary alone cannot promise - "
                + "so a List has to remember it - reread README ex4.");

        Teach.Throws<KeyNotFoundException>(() => commands.Run("nope", "x"),
            "An unknown command is a KeyNotFoundException, not a null return - reread README ex4.");

        InvalidOperationException failed = Teach.Throws<InvalidOperationException>(
            () => commands.Run("boom", "x"),
            "A handler that throws is wrapped, so the caller can tell a dispatch problem from a "
                + "handler problem - reread README ex4.");
        Teach.Equal("command failed: boom", failed.Message, "...with the command named...");
        Teach.True(failed.InnerException is FormatException,
            "...and the handler's own exception kept as the InnerException - reread README ex4.");
        Teach.Equal("bad input", failed.InnerException!.Message, "...message and all.");

        Teach.Throws<ArgumentException>(
            () => commands.Register("upper", text => "different"),
            "Registering a name twice is a programming mistake, and silently replacing the first "
                + "handler is how it stays hidden - reread README ex4.");
        Teach.Equal("HI", commands.Run("upper", "hi"),
            "...and the refused registration changed nothing - reread README ex4.");
        Teach.Equal(3, commands.Names.Count, "...including the name list.");
    }

    [Fact]
    public void Ex5_YourOwnComparerStreamedThroughAnIterator()
    {
        CaseInsensitive comparer = new CaseInsensitive();

        Teach.True(comparer.Equals("Ada", "ada"), "Case is the only difference - reread README ex5.");
        Teach.True(!comparer.Equals("Ada", "Bob"), "...and these really are different.");
        Teach.Equal(comparer.GetHashCode("Ada"), comparer.GetHashCode("ADA"),
            "Two values that compare equal MUST have the same hash code, or the HashSet will put "
                + "them in different buckets and never notice - reread README ex5.");

        string[] words = { "Ada", "ada", "BOB", "bob", "ADA" };
        Teach.Equal("Ada|BOB", string.Join("|", Streams.FirstOfEach(words, comparer)),
            "The FIRST spelling of each distinct word survives - reread README ex5.");

        Teach.Equal("Ada|ada|BOB|bob|ADA",
            string.Join("|", Streams.FirstOfEach(words, EqualityComparer<string>.Default)),
            "With the default comparer all five spellings are different strings, so nothing is a "
                + "repeat and nothing is dropped. The comparer, not the method, decides what "
                + "distinct means - reread README ex5.");

        Counting source = new Counting("a", "b", "c", "d");
        IEnumerable<string> lazy = Streams.FirstOfEach(source, comparer);
        Teach.Equal(0, source.Reads,
            "Building the sequence must read nothing: an iterator method's body does not run "
                + "until somebody enumerates it - reread README ex5.");

        Teach.Equal("a", string.Join("|", lazy.Take(1)),
            "One item asked for...");
        Teach.Equal(1, source.Reads,
            "...and one item read. Building a HashSet of everything first would have read all "
                + "four - reread README ex5.");

        Teach.Equal(0, Streams.FirstOfEach(Array.Empty<string>(), comparer).Count(),
            "Nothing in, nothing out.");
    }

    [Fact]
    public void Ex6_AnEventACollectionAndAQuery()
    {
        Basket basket = new Basket();
        List<string> announced = new List<string>();
        basket.Added += item => announced.Add(item);

        Teach.Equal(1, basket.Listeners, "One handler is listening.");

        foreach (string item in new[] { "apple", "pear", "apple", "fig", "apple", "pear" })
        {
            basket.Add(item);
        }

        Teach.Equal(6, basket.Count, "Six adds, six items - duplicates are kept.");
        Teach.Equal("apple|pear|apple|fig|apple|pear", string.Join("|", announced),
            "Every add raised the event, in order - reread README ex6.");

        Teach.Equal("apple|pear", string.Join("|", basket.Duplicates()),
            "The items that appear more than once, each named once, in first-seen order - reread "
                + "README ex6.");

        Teach.Equal("apple=3|pear=2|fig=1", string.Join("|", basket.Tally()),
            "Counted, then ordered by count descending with the ordinal tie-break behind it - "
                + "reread README ex6.");

        announced.Clear();
        Teach.Throws<ArgumentException>(() => basket.Add(""),
            "An empty item is a caller mistake - reread README ex6.");
        Teach.Equal(6, basket.Count,
            "...and the refused add did not go in. Validate before you mutate - reread "
                + "README ex6.");
        Teach.Equal(0, announced.Count,
            "...and did not announce anything either: an event says something HAPPENED - reread "
                + "README ex6.");

        Basket empty = new Basket();
        Teach.Equal(0, empty.Duplicates().Count, "An empty basket has no duplicates...");
        Teach.Equal(0, empty.Tally().Count, "...and nothing to tally.");
        empty.Add("solo");
        Teach.Equal(0, empty.Duplicates().Count, "One of something is not a duplicate.");
    }

    [Fact]
    public async Task Ex7_ManyTasksSomeOfThemBroken()
    {
        Outcome outcome = await Fetching.GatherAsync(new[]
        {
            Task.FromResult("a"),
            Task.FromException<string>(new InvalidOperationException("x")),
            Task.FromResult("b"),
        });

        Teach.Equal("a|b", string.Join("|", outcome.Successes),
            "The results that arrived, in task order - reread README ex7.");
        Teach.Equal("x", string.Join("|", outcome.Failures),
            "...and the message of the one that did not. One failure must not hide the two "
                + "successes, which is exactly what letting WhenAll's throw escape would do - "
                + "reread README ex7.");

        Outcome nothing = await Fetching.GatherAsync(Array.Empty<Task<string>>());
        Teach.Equal(0, nothing.Successes.Count, "No tasks, no successes...");
        Teach.Equal(0, nothing.Failures.Count, "...and no failures.");

        Outcome allBad = await Fetching.GatherAsync(new[]
        {
            Task.FromException<string>(new InvalidOperationException("one")),
            Task.FromException<string>(new InvalidOperationException("two")),
        });
        Teach.Equal("one|two", string.Join("|", allBad.Failures),
            "Both failures, in task order - awaiting WhenAll would have shown only the first - "
                + "reread README ex7.");

        Dictionary<string, TaskCompletionSource<string>> sources =
            new Dictionary<string, TaskCompletionSource<string>>
            {
                ["b"] = new TaskCompletionSource<string>(),
                ["a"] = new TaskCompletionSource<string>(),
                ["c"] = new TaskCompletionSource<string>(),
            };

        int fetches = 0;
        Task<List<string>> lookup = Fetching.LookupAsync(
            new[] { "b", "a", "c" },
            id =>
            {
                fetches++;
                return sources[id].Task;
            });

        Teach.Equal(3, fetches,
            "All three fetches were started before the method waited for any of them. Awaiting "
                + "inside the loop that starts them would have made three concurrent calls into "
                + "three sequential ones - reread README ex7.");
        Teach.True(!lookup.IsCompleted, "...and none of them has answered yet.");

        sources["c"].SetException(new InvalidOperationException("c is down"));
        sources["a"].SetResult("A");
        sources["b"].SetResult("B");

        Teach.Equal("a=A|b=B", string.Join("|", await lookup),
            "The successful ones only, ordered by id rather than by who answered first - reread "
                + "README ex7.");
    }

    [Fact]
    public void Ex8_ASmallRepositoryThatUsesMostOfTheTrack()
    {
        Repository repository = new Repository();
        List<string> saved = new List<string>();
        repository.Saved += employee => saved.Add(employee.Name);

        Teach.Equal(1, repository.Listeners, "One handler.");
        Teach.Equal(0, repository.Count, "Nothing stored yet.");

        repository.Save(new Employee(1, "ada", "eng", 100m));
        repository.Save(new Employee(2, "bob", "eng", 50m));
        repository.Save(new Employee(3, "cleo", "ops", 70m));

        Teach.Equal(3, repository.Count, "Three employees.");
        Teach.Equal("ada|bob|cleo", string.Join("|", saved), "...each announced as it went in.");
        Teach.Equal("bob", repository.Get(2).Name, "Fetched by id - reread README ex8.");

        Teach.Throws<KeyNotFoundException>(() => repository.Get(9),
            "An id nobody has is a KeyNotFoundException rather than null - reread README ex8.");

        repository.Save(new Employee(1, "ada", "eng", 120m));
        Teach.Equal(3, repository.Count,
            "Saving an existing id REPLACES rather than adds - reread README ex8.");
        Teach.Equal(120m, repository.Get(1).Salary, "...with the new values...");
        Teach.Equal("ada|bob|cleo|ada", string.Join("|", saved), "...and Saved fired again.");

        Teach.Equal("ada|bob", string.Join("|", repository.Query(e => e.Dept == "eng").Select(e => e.Name)),
            "The query runs over the stored employees in INSERTION order - and ada is still "
                + "first, because a replace does not move her to the end - reread README ex8.");
        Teach.Equal(3, repository.Query(e => true).Count, "A predicate that accepts everything.");
        Teach.Equal(0, repository.Query(e => e.Salary > 1000m).Count,
            "...and one that accepts nothing gives an empty list, not null.");

        Teach.Equal("eng=170|ops=70", string.Join("|", repository.DeptTotals()),
            "120 plus 50 for eng, and ops on its own, ordered by department - reread README ex8.");

        Teach.True(repository.Remove(2), "Removing an employee who is there says so...");
        Teach.True(!repository.Remove(2), "...and removing them again says not - reread README ex8.");
        Teach.Equal(2, repository.Count, "Two left.");
        Teach.Equal("eng=120|ops=70", string.Join("|", repository.DeptTotals()),
            "...and the totals followed. If eng still says 170, the removal took the employee out "
                + "of the dictionary but left the id in the order list - reread README ex8.");
        Teach.Equal("ada", string.Join("|", repository.Query(e => e.Dept == "eng").Select(e => e.Name)),
            "...and so did the query.");

        Repository empty = new Repository();
        Teach.Equal(0, empty.DeptTotals().Count, "No employees, no departments.");
        Teach.Equal(0, empty.Listeners, "...and nobody listening.");
        empty.Save(new Employee(1, "solo", "x", 1m));
        Teach.Equal("x=1", string.Join("|", empty.DeptTotals()),
            "Formatting a decimal with the invariant culture keeps it readable everywhere - "
                + "reread README ex8.");
    }
}
```
