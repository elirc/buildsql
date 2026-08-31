# d20 - LINQ joins and flattening drills

Eight problems on putting sequences together: `Join`, `GroupJoin` and the left
join it builds, `SelectMany` in its two forms, `Zip`, the set operators,
composite join keys, a three-way report, and flattening a structure that nests
as deep as it likes. They drill lesson 11 - reread `11_linq_2` if `SelectMany`
is still the operator you look up every time.

Every file lives in `src/Lessons/D20_LinqJoinsFlatten/`. Nothing here depends
on anything else here.

## Exercise 1 - the inner join

`Joins.CustomerAndProduct(customers, orders)` returns `"ada:book"` for every
order that has a matching customer, in the order the *orders* arrive.
`Joins.ProductsFor(customers, orders, name)` returns that customer's products
in order, and is empty for a name that does not exist.

Edit `src/Lessons/D20_LinqJoinsFlatten/Ex1.cs`.

```
uv run dojo test csharp d20_linq_joins_flatten ex1
```

## Exercise 2 - the left join, spelled out

`LeftJoins.CustomerBasket(customers, orders)` returns `"ada:book,lamp"` for
*every* customer, ordered by name, with `"(none)"` where the customer has no
orders. `LeftJoins.Idle` names the customers with no orders.
`LeftJoins.EveryRow` produces the flattened left join - one row per pair, plus
`"zoe/-"` for a customer with none - ordered by the whole string, ordinal.

Edit `src/Lessons/D20_LinqJoinsFlatten/Ex2.cs`.

```
uv run dojo test csharp d20_linq_joins_flatten ex2
```

## Exercise 3 - flattening

`Flatten.All(groups)` concatenates a sequence of sequences.
`Flatten.Letters(words)` gives every character of every word.
`Flatten.Pairs(lefts, rights)` gives the cross product as `"a-1"`, with the
left moving slowest.

Edit `src/Lessons/D20_LinqJoinsFlatten/Ex3.cs`.

```
uv run dojo test csharp d20_linq_joins_flatten ex3
```

## Exercise 4 - keeping the parent while you flatten

`Documents.AllLines(invoices)` gives `"INV1/paper"` for every line of every
invoice. `Documents.NumberedLines(invoices)` gives `"INV1#1: paper"` with the
numbering restarting at 1 *within* each invoice. `Documents.Blank(invoices)`
names the invoices with no lines - the ones flattening makes disappear.

Edit `src/Lessons/D20_LinqJoinsFlatten/Ex4.cs`.

```
uv run dojo test csharp d20_linq_joins_flatten ex4
```

## Exercise 5 - pairing up, and set arithmetic

`Combine.Labelled(names, scores)` zips them into `"ada=10"` and stops at the
shorter. `Combine.InBoth`, `Combine.OnlyInFirst` and `Combine.EitherOne` are
intersection, difference and union - each de-duplicating -
and `Combine.BothEndToEnd` is the one that keeps duplicates.

Edit `src/Lessons/D20_LinqJoinsFlatten/Ex5.cs`.

```
uv run dojo test csharp d20_linq_joins_flatten ex5
```

## Exercise 6 - joining on more than one column

`Rota.Covered(shifts, bookings)` returns `"Mon/A smith->ada"` for every booking
that has a shift on the same day *and* in the same room, ordered by day, room,
patient and nurse (all ordinal). Two shifts covering one booking produce two
rows. `Rota.Uncovered(shifts, bookings)` returns `"Tue/B/brown"` for the
bookings nothing covers, in the same ordering.

Edit `src/Lessons/D20_LinqJoinsFlatten/Ex6.cs`.

```
uv run dojo test csharp d20_linq_joins_flatten ex6
```

## Exercise 7 - a report across three sequences

`Registry.Transcript(students, courses, enrolments)` joins through both and
returns `"ada/Maths=90"`, ordered by grade descending, then student name, then
course title. `Registry.CourseAverages(courses, enrolments)` returns
`"Maths=77"` per course with at least one enrolment - the integer average,
rounded down - ordered by title. Read carefully which sequences each one
consults.

Edit `src/Lessons/D20_LinqJoinsFlatten/Ex7.cs`.

```
uv run dojo test csharp d20_linq_joins_flatten ex7
```

## Exercise 8 - flattening something that nests without limit

A `Category` holds child `Category` objects, to any depth. `Tree.Paths(root)`
returns the full path to every node - `"root/tools/hammer"` - depth first, each
parent immediately before its own subtree. `Tree.Leaves(root)` names the nodes
with no children in the same order. `Tree.Depth(root)` counts the levels; a
lone root is 1.

Edit `src/Lessons/D20_LinqJoinsFlatten/Ex8.cs`.

```
uv run dojo test csharp d20_linq_joins_flatten ex8
```

## The gate

This is the entire gate class, `tests/Gates/D20_LinqJoinsFlattenTests.cs`:

```csharp
using CSharpDojo.D20_LinqJoinsFlatten;

namespace CSharpDojo.Gates;

public class D20_LinqJoinsFlattenTests
{
    private static Customer[] Customers()
    {
        return new[]
        {
            new Customer(1, "ada"),
            new Customer(2, "bob"),
            new Customer(3, "zoe"),
        };
    }

    private static Order[] Orders()
    {
        return new[]
        {
            new Order(10, 1, "book"),
            new Order(11, 2, "pen"),
            new Order(12, 1, "lamp"),
            new Order(13, 9, "ghost"),
        };
    }

    [Fact]
    public void Ex1_TheInnerJoin()
    {
        Teach.Equal("ada:book|bob:pen|ada:lamp",
            string.Join("|", Joins.CustomerAndProduct(Customers(), Orders())),
            "Join matches on the two key selectors and the result selector builds the row. The "
                + "output keeps the OUTER sequence's order, which is the orders here - reread "
                + "README ex1.");

        Teach.Equal(3, Joins.CustomerAndProduct(Customers(), Orders()).Count,
            "Four orders in, three rows out: order 13 names customer 9, who does not exist, and "
                + "an inner join simply drops a row with no partner. Nothing warns you - reread "
                + "README ex1.");

        Teach.Equal("book|lamp", string.Join("|", Joins.ProductsFor(Customers(), Orders(), "ada")),
            "ada's two products, in order - reread README ex1.");
        Teach.Equal(0, Joins.ProductsFor(Customers(), Orders(), "zoe").Count,
            "zoe exists and has ordered nothing, so an inner join gives her no rows at all - "
                + "reread README ex1.");
        Teach.Equal(0, Joins.ProductsFor(Customers(), Orders(), "nobody").Count,
            "...and an unknown name is the same empty answer, which is exactly the ambiguity a "
                + "left join exists to remove - reread README ex1.");

        Teach.Equal(0, Joins.CustomerAndProduct(Customers(), Array.Empty<Order>()).Count,
            "No orders, no rows.");
        Teach.Equal(0, Joins.CustomerAndProduct(Array.Empty<Customer>(), Orders()).Count,
            "No customers, no rows either - a join with an empty side is empty.");
    }

    [Fact]
    public void Ex2_TheLeftJoinSpelledOut()
    {
        Teach.Equal("ada:book,lamp|bob:pen|zoe:(none)",
            string.Join("|", LeftJoins.CustomerBasket(Customers(), Orders())),
            "GroupJoin gives every OUTER item a group of its matches - possibly empty - so zoe "
                + "gets a row where a plain Join would have dropped her. That is the whole "
                + "difference between the two - reread README ex2.");

        Teach.Equal("zoe", string.Join("|", LeftJoins.Idle(Customers(), Orders())),
            "The customers whose group came back empty. Any() on the group is the test - reread "
                + "README ex2.");

        Teach.Equal("ada/book|ada/lamp|bob/pen|zoe/-",
            string.Join("|", LeftJoins.EveryRow(Customers(), Orders())),
            "GroupJoin then SelectMany with DefaultIfEmpty is the flattened left join: the empty "
                + "group becomes one null element, so zoe still produces exactly one row - "
                + "reread README ex2.");

        Teach.Equal("ada:(none)|bob:(none)|zoe:(none)",
            string.Join("|", LeftJoins.CustomerBasket(Customers(), Array.Empty<Order>())),
            "With no orders at all, every customer still gets a row - reread README ex2.");
        Teach.Equal(3, LeftJoins.Idle(Customers(), Array.Empty<Order>()).Count,
            "...and all three of them are idle.");
        Teach.Equal(0, LeftJoins.CustomerBasket(Array.Empty<Customer>(), Orders()).Count,
            "The outer sequence decides how many rows there are, so no customers means no rows - "
                + "the orphaned orders are NOT reported. A left join is one-sided on purpose - "
                + "reread README ex2.");
    }

    [Fact]
    public void Ex3_Flattening()
    {
        IEnumerable<int>[] groups = { new[] { 1, 2 }, Array.Empty<int>(), new[] { 3 } };
        Teach.Equal("1|2|3", string.Join("|", Flatten.All(groups)),
            "SelectMany concatenates the inner sequences in order. The empty one contributes "
                + "nothing rather than a gap - reread README ex3.");
        Teach.Equal(0, Flatten.All(Array.Empty<IEnumerable<int>>()).Count, "Nothing in, nothing out.");

        Teach.Equal("a|b|c", string.Join("|", Flatten.Letters(new[] { "ab", "c" })),
            "A string is already an IEnumerable<char>, so the selector can just be the word "
                + "itself - reread README ex3.");
        Teach.Equal(0, Flatten.Letters(new[] { "", "" }).Count, "Two empty words are no letters.");

        Teach.Equal("a-1|a-2|b-1|b-2",
            string.Join("|", Flatten.Pairs(new[] { "a", "b" }, new[] { "1", "2" })),
            "The LEFT moves slowest: the first left is paired with every right before the second "
                + "left appears, which is the same order two nested foreach loops would give - "
                + "reread README ex3.");
        Teach.Equal(0, Flatten.Pairs(new[] { "a" }, Array.Empty<string>()).Count,
            "A cross product with an empty side is empty - reread README ex3.");
        Teach.Equal(6, Flatten.Pairs(new[] { "a", "b", "c" }, new[] { "1", "2" }).Count,
            "Three times two.");
    }

    [Fact]
    public void Ex4_KeepingTheParentWhileYouFlatten()
    {
        Invoice[] invoices =
        {
            new Invoice("INV1", new List<string> { "paper", "ink" }),
            new Invoice("INV2", new List<string>()),
            new Invoice("INV3", new List<string> { "glue" }),
        };

        Teach.Equal("INV1/paper|INV1/ink|INV3/glue",
            string.Join("|", Documents.AllLines(invoices)),
            "The two-lambda SelectMany hands the result selector both the invoice and the line, "
                + "so the parent is still in scope after the flattening. INV2 contributes nothing "
                + "- reread README ex4.");

        Teach.Equal("INV1#1: paper|INV1#2: ink|INV3#1: glue",
            string.Join("|", Documents.NumberedLines(invoices)),
            "The numbering restarts at 1 for each invoice, so the index has to come from the "
                + "INNER Select - an index taken over the flattened sequence would number glue as "
                + "3 - reread README ex4.");

        Teach.Equal("INV2", string.Join("|", Documents.Blank(invoices)),
            "An invoice with no lines vanishes from a flattened view, which is exactly why it is "
                + "worth reporting separately - reread README ex4.");

        Teach.Equal(0, Documents.AllLines(Array.Empty<Invoice>()).Count, "No invoices, no lines.");
        Teach.Equal(0, Documents.Blank(new[] { invoices[0] }).Count, "...and an invoice with lines is not blank.");
    }

    [Fact]
    public void Ex5_PairingUpAndSetArithmetic()
    {
        Teach.Equal("ada=10|bob=20",
            string.Join("|", Combine.Labelled(new[] { "ada", "bob", "cleo" }, new[] { 10, 20 })),
            "Zip walks both sequences in step and stops when the SHORTER one runs out - cleo has "
                + "no score, so cleo is not there. It does not throw and it does not pad - "
                + "reread README ex5.");
        Teach.Equal(0, Combine.Labelled(Array.Empty<string>(), new[] { 1 }).Count,
            "One empty side ends it immediately.");

        int[] first = { 1, 2, 2, 3 };
        int[] second = { 2, 3, 4 };

        Teach.Equal("2|3", string.Join("|", Combine.InBoth(first, second)),
            "Intersect keeps what is in both, ONCE each - the duplicate 2 on the left does not "
                + "produce two rows, because these operators think in sets - reread README ex5.");
        Teach.Equal("1", string.Join("|", Combine.OnlyInFirst(first, second)),
            "Except removes everything the second sequence has. Note it is one-sided: the 4 that "
                + "is only in the second sequence is not reported - reread README ex5.");
        Teach.Equal("1|2|3|4", string.Join("|", Combine.EitherOne(first, new[] { 3, 4 })),
            "Union is Concat followed by Distinct, first sequence first - reread README ex5.");
        Teach.Equal("1|2|2|3", string.Join("|", Combine.BothEndToEnd(new[] { 1, 2 }, new[] { 2, 3 })),
            "...and Concat is the one that keeps the duplicates. Reaching for Union when you "
                + "meant Concat silently loses rows - reread README ex5.");

        Teach.Equal(0, Combine.OnlyInFirst(first, first).Count, "Everything is in both.");
        Teach.Equal("1|2|3", string.Join("|", Combine.EitherOne(first, Array.Empty<int>())),
            "Union against nothing still de-duplicates its own input - reread README ex5.");
    }

    [Fact]
    public void Ex6_JoiningOnMoreThanOneColumn()
    {
        Shift[] shifts =
        {
            new Shift("Mon", "A", "ada"),
            new Shift("Mon", "B", "bob"),
            new Shift("Tue", "A", "cleo"),
            new Shift("Mon", "A", "dan"),
        };

        Booking[] bookings =
        {
            new Booking("Mon", "A", "smith"),
            new Booking("Mon", "B", "jones"),
            new Booking("Tue", "B", "brown"),
            new Booking("Mon", "A", "adams"),
        };

        Teach.Equal(
            "Mon/A adams->ada|Mon/A adams->dan|Mon/A smith->ada|Mon/A smith->dan|Mon/B jones->bob",
            string.Join("|", Rota.Covered(shifts, bookings)),
            "The key is the (Day, Room) pair, and two nurses cover Mon/A, so each Mon/A booking "
                + "produces TWO rows - a join multiplies, it does not pick - reread README ex6.");

        Teach.Equal("Tue/B/brown", string.Join("|", Rota.Uncovered(shifts, bookings)),
            "Tue has a shift and B has a shift, but not Tue AND B together - which is exactly the "
                + "row a join on either column alone would have got wrong - reread README ex6.");

        Teach.Equal(0, Rota.Covered(Array.Empty<Shift>(), bookings).Count, "No shifts, nothing covered...");
        Teach.Equal(4, Rota.Uncovered(Array.Empty<Shift>(), bookings).Count, "...and everything uncovered.");
        Teach.Equal(0, Rota.Uncovered(shifts, Array.Empty<Booking>()).Count,
            "A shift with no booking is not reported: this report is about bookings - reread "
                + "README ex6.");
    }

    [Fact]
    public void Ex7_AReportAcrossThreeSequences()
    {
        Student[] students = { new Student(1, "ada"), new Student(2, "bob"), new Student(3, "cleo") };
        Course[] courses = { new Course(10, "Maths"), new Course(11, "Art") };
        Enrolment[] enrolments =
        {
            new Enrolment(1, 10, 90),
            new Enrolment(2, 10, 80),
            new Enrolment(1, 11, 70),
            new Enrolment(3, 10, 90),
            new Enrolment(9, 10, 50),
            new Enrolment(2, 99, 60),
        };

        Teach.Equal("ada/Maths=90|cleo/Maths=90|bob/Maths=80|ada/Art=70",
            string.Join("|", Registry.Transcript(students, courses, enrolments)),
            "Two joins chained, then one ordering over the finished rows. The enrolment for "
                + "student 9 and the one for course 99 both vanish, because each join drops what "
                + "it cannot match - reread README ex7.");

        Teach.Equal(4, Registry.Transcript(students, courses, enrolments).Count,
            "Six enrolments in, four rows out.");

        Teach.Equal("Art=70|Maths=77",
            string.Join("|", Registry.CourseAverages(courses, enrolments)),
            "Maths has FOUR grades here, not three: the enrolment for the non-existent student 9 "
                + "still names a real course, and this query never looks at students. 310 over 4 "
                + "is 77 after integer division - reread README ex7.");

        Teach.Equal(0, Registry.CourseAverages(courses, Array.Empty<Enrolment>()).Count,
            "A course with no enrolments produces no row at all - reread README ex7.");
        Teach.Equal(0, Registry.Transcript(Array.Empty<Student>(), courses, enrolments).Count,
            "With no students, nothing survives the first join.");
    }

    [Fact]
    public void Ex8_FlatteningSomethingThatNestsWithoutLimit()
    {
        Category root = new Category("root", new List<Category>
        {
            new Category("tools", new List<Category>
            {
                new Category("hammer", new List<Category>()),
                new Category("saw", new List<Category>()),
            }),
            new Category("food", new List<Category>
            {
                new Category("fruit", new List<Category>
                {
                    new Category("apple", new List<Category>()),
                }),
            }),
            new Category("misc", new List<Category>()),
        });

        Teach.Equal(
            "root|root/tools|root/tools/hammer|root/tools/saw|root/food|root/food/fruit|"
                + "root/food/fruit/apple|root/misc",
            string.Join("|", Tree.Paths(root)),
            "Depth first, each node immediately before its own subtree, and the path accumulates "
                + "as the recursion descends - so the prefix has to be passed DOWN rather than "
                + "rebuilt on the way back - reread README ex8.");

        Teach.Equal("hammer|saw|apple|misc", string.Join("|", Tree.Leaves(root)),
            "The nodes with no children, in the same depth-first order. A node with children "
                + "contributes only what its children contribute - reread README ex8.");

        Teach.Equal(4, Tree.Depth(root),
            "root, food, fruit, apple is the longest chain. Depth is 1 plus the deepest child, "
                + "and a leaf is 1 - reread README ex8.");

        Category lonely = new Category("alone", new List<Category>());
        Teach.Equal("alone", string.Join("|", Tree.Paths(lonely)),
            "A root with no children is one path - reread README ex8.");
        Teach.Equal("alone", string.Join("|", Tree.Leaves(lonely)),
            "...and it is its own leaf: having no children is the whole definition - reread "
                + "README ex8.");
        Teach.Equal(1, Tree.Depth(lonely), "...and one level deep.");

        Category chain = new Category("a", new List<Category>
        {
            new Category("b", new List<Category>
            {
                new Category("c", new List<Category>()),
            }),
        });
        Teach.Equal("a|a/b|a/b/c", string.Join("|", Tree.Paths(chain)), "A chain has no branching.");
        Teach.Equal(3, Tree.Depth(chain), "...and is as deep as it is long.");
        Teach.Equal("c", string.Join("|", Tree.Leaves(chain)), "...with exactly one leaf.");
    }
}
```
