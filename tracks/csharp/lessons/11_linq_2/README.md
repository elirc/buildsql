# 11 — LINQ, part 2

Lesson 10 covered the operators that keep a sequence a sequence. This one
covers the operators that change its *shape*: many rows into groups, two
sequences into one, one row into many. If lesson 10 was `SELECT ... WHERE ...
ORDER BY`, this is `GROUP BY`, `JOIN`, `HAVING` and the aggregates — and the
translation is close enough that you can read most of it straight across from
the SQL course.

The one place the analogy is worth pushing on is what a *group* is. In SQL, a
`GROUP BY` collapses rows and you may only see aggregates afterwards. In LINQ,
`GroupBy` hands you a sequence of groups and **each group is still a sequence
you can look inside**. That is strictly more powerful — you can take the three
biggest sales per category without a window function — and it is the reason
LINQ's grouping feels different for the first hour.

The other reason this lesson matters: this is what you will actually write at
work. EF Core queries are these operators, translated to SQL by an expression
tree walker. Getting the grouping and joining right in memory, where you can see
every step, is how you learn to predict what EF will send to the database.

## Concept — four operators that reshape

**`GroupBy`** turns rows into groups. Each group has a `Key` and *is* an
`IEnumerable<T>` of its members:

```csharp
sales.GroupBy(s => s.Category)                       // IEnumerable<IGrouping<string, Sale>>
     .Select(g => $"{g.Key}: {g.Sum(s => s.Amount)}")
```

Grouping an empty sequence gives no groups — not one empty group — which is the
same as SQL.

**`Join`** matches two sequences on a key and gives you one row per matched
pair. It is an **inner** join: anything unmatched on either side disappears.

```csharp
sales.Join(customers,
    sale => sale.CustomerId,      // key on the left
    customer => customer.Id,      // key on the right
    (sale, customer) => new { customer.Name, sale.Amount });
```

**`GroupJoin`** is the left join: one row per *outer* item, paired with a
(possibly empty) group of matches. That empty group is how a customer with no
sales still appears.

**`SelectMany`** flattens. Where `Select` gives one output per input,
`SelectMany` takes a lambda returning a sequence and concatenates the lot:

```csharp
shipments.SelectMany(s => s.Items);                              // just the items
shipments.SelectMany(s => s.Items, (s, item) => $"{s.Code}:{item}");  // paired with their parent
```

**`Aggregate`** is the general fold — `Sum`, `Min`, `Max` and `Count` are named
special cases:

```csharp
words.Aggregate((best, w) => w.Length > best.Length ? w : best);
```

The seedless version starts from the first element and **throws on an empty
sequence**; the overload taking a seed does not.

**Query syntax** is the other way to write all of this, and for grouping and
joining it often reads better:

```csharp
from customer in customers
group customer by customer.City into city
orderby city.Count() descending, city.Key
select $"{city.Key}: {city.Count()}"
```

The compiler rewrites that into exactly the method calls above — `group ... into`
becomes `GroupBy`, the comma in `orderby` becomes `ThenBy`, `join ... on ... equals`
becomes `Join`. Neither form is faster; use whichever is clearer, and be able to
read both, because every codebase has some of each.

## Exercise 1 — GROUP BY

Edit `src/Lessons/L11_Linq2/Ex1.cs`. `TotalByCategory` returns
`"category: total"` per category, biggest total first with the category name as
tie-break. `CountByCategory` returns a `Dictionary<string, int>` of how many
sales each category had.

The shared model is in `Model.cs` and you never edit it. Watch the difference
between `group.Count()` (this group) and `sales.Count()` (everything) — the same
mistake as an aggregate outside its `GROUP BY`.

```
uv run dojo test csharp 11_linq_2 ex1
```

## Exercise 2 — INNER JOIN and LEFT JOIN

Edit `src/Lessons/L11_Linq2/Ex2.cs`. `SaleLabels` returns
`"customer - category"` for every sale, matched to its customer, in sale-id
order. `SaleCounts` returns `"name: count"` for **every** customer, A–Z —
including zed, who has no sales and must report `0`.

One of those is `Join` and the other is `GroupJoin`, and picking the wrong one
silently drops a row. That is the LINQ version of the inner/outer join decision
from the SQL course's lesson 09.

```
uv run dojo test csharp 11_linq_2 ex2
```

## Exercise 3 — one row in, many out

Edit `src/Lessons/L11_Linq2/Ex3.cs`. `AllItems` flattens every shipment's items
into one sequence. `LabelledItems` does the same but tags each item with its
shipment code: `"A:hat"`.

Note what shipment B — the one with no items — does to the output: nothing at
all. It does not appear as a blank. A row whose child collection is empty
contributes no rows, which is exactly why an inner join drops unmatched rows.

```
uv run dojo test csharp 11_linq_2 ex3
```

## Exercise 4 — folding, and the other syntax

Edit `src/Lessons/L11_Linq2/Ex4.cs`. `Longest` returns the longest word using
`Aggregate` — earlier word wins a tie, and an empty sequence is allowed to
throw. `CitiesByCustomerCount` returns `"city: count"`, most customers first
with the city name as tie-break.

Write the second one in **query syntax**. The gate cannot tell which syntax you
used, and that is not the point: you are here to be able to read both, and this
is the query where the keyword form earns its keep.

```
uv run dojo test csharp 11_linq_2 ex4
```

## Challenge — a revenue report from two tables

Edit `src/Lessons/L11_Linq2/Challenge.cs`. `TopCustomers(customers, sales, count)`
returns the biggest-spending customers as `"bo: 390 | ada: 165 | cy: 120"` —
biggest first, ties by name, customers with no sales excluded, `"(none)"` when
there is nothing at all.

Honest difficulty note: four operators in one chain, and the design decision is
in the first line. Start from `sales` and join to `customers` and the
no-sales customer is excluded automatically; start from `customers` with a
`GroupJoin` and you have to exclude them by hand. Read the requirement, then
pick the join — which is exactly the conversation you will have about a real
report.

```
uv run dojo test csharp 11_linq_2 challenge
```

## Review

`review1` is `HAVING`: filtering the groups rather than the rows, plus a `Max`
per group. `dojo review` will bring it back.

## The gate

This is the entire gate class, `tests/Gates/L11_Linq2Tests.cs`:

```csharp
using CSharpDojo.L11_Linq2;

namespace CSharpDojo.Gates;

public class L11_Linq2Tests
{
    private static List<Customer> Customers() => new List<Customer>
    {
        new Customer(1, "ada", "london"),
        new Customer(2, "bo", "bristol"),
        new Customer(3, "cy", "london"),
        new Customer(4, "zed", "leeds"),
    };

    private static List<Sale> Sales() => new List<Sale>
    {
        new Sale(1, 1, "books", 120m),
        new Sale(2, 1, "toys", 45m),
        new Sale(3, 2, "books", 300m),
        new Sale(4, 3, "toys", 120m),
        new Sale(5, 2, "books", 90m),
    };

    private static List<Shipment> Shipments() => new List<Shipment>
    {
        new Shipment("A", new List<string> { "hat", "scarf" }),
        new Shipment("B", new List<string>()),
        new Shipment("C", new List<string> { "boots" }),
    };

    [Fact]
    public void Ex1_GroupByCollapsesRowsIntoGroups()
    {
        Teach.Equal("books: 510, toys: 165", string.Join(", ", Grouped.TotalByCategory(Sales())),
            "books is 120 + 300 + 90 = 510 and toys is 45 + 120 = 165, biggest first. GroupBy "
                + "gives you a sequence of groups; Sum turns each group back into one number - "
                + "reread README ex1.");

        Dictionary<string, int> counts = Grouped.CountByCategory(Sales());

        Teach.Equal(2, counts.Count, "Two distinct categories, so two entries.");
        Teach.Equal(3, counts["books"], "Three book sales - group.Count(), not sales.Count().");
        Teach.Equal(2, counts["toys"], "Two toy sales.");

        Teach.Equal(0, Grouped.CountByCategory(new List<Sale>()).Count,
            "No sales, no groups - and no exception. GroupBy over an empty sequence yields "
                + "nothing rather than one empty group.");
    }

    [Fact]
    public void Ex2_JoinKeepsMatchesAndGroupJoinKeepsEverybody()
    {
        Teach.Equal("ada - books, ada - toys, bo - books, cy - toys, bo - books",
            string.Join(", ", Joins.SaleLabels(Customers(), Sales())),
            "One line per SALE, matched to its customer on CustomerId = Id, in sale-id order. "
                + "Join is an INNER JOIN: zed has no sales so zed never appears - reread "
                + "README ex2.");

        Teach.Equal("ada: 2, bo: 2, cy: 1, zed: 0",
            string.Join(", ", Joins.SaleCounts(Customers(), Sales())),
            "Every customer appears, including zed with 0. That is a LEFT JOIN, and in LINQ it "
                + "is GroupJoin - which hands you each customer together with THEIR sales as a "
                + "(possibly empty) group. A plain Join would silently drop zed - reread "
                + "README ex2.");

        Teach.Equal(4, Joins.SaleCounts(Customers(), new List<Sale>()).Count,
            "With no sales at all, all four customers still appear - each with 0.");
    }

    [Fact]
    public void Ex3_SelectManyFlattensRowsThatHoldCollections()
    {
        Teach.Equal("hat, scarf, boots", string.Join(", ", Flatten.AllItems(Shipments())),
            "Three shipments, one flat list of items. Shipment B is empty and contributes "
                + "nothing - it does not appear as a blank - reread README ex3.");

        Teach.Equal("A:hat, A:scarf, C:boots",
            string.Join(", ", Flatten.LabelledItems(Shipments())),
            "The item alone loses which shipment it came from. SelectMany's second lambda "
                + "gets both the outer row and the inner item, which is exactly the pairing a "
                + "join produces - reread README ex3.");

        Teach.Equal(0, Flatten.AllItems(new List<Shipment>()).Count, "Nothing to flatten.");

        Teach.Equal(0, Flatten.AllItems(new List<Shipment> { new Shipment("Z", new List<string>()) }).Count,
            "A shipment with an empty item list yields no rows - the same reason an INNER "
                + "JOIN drops a row with no matches.");
    }

    [Fact]
    public void Ex4_AggregateFoldsAndQuerySyntaxGroups()
    {
        Teach.Equal("three", Folding.Longest(new[] { "a", "three", "xx" }),
            "Aggregate carries a running best through the sequence - reread README ex4.");

        Teach.Equal("aaa", Folding.Longest(new[] { "aaa", "bbb" }),
            "A tie keeps the EARLIER word, which is what a strictly-greater comparison gives "
                + "you - the same tie-break decision as lesson 02.");

        Teach.Equal("only", Folding.Longest(new[] { "only" }),
            "With one item, Aggregate never calls your lambda at all - the seed is the first "
                + "element.");

        Teach.Throws<InvalidOperationException>(() => Folding.Longest(Array.Empty<string>()),
            "The seedless Aggregate has nothing to start from, so it throws. Do not paper over "
                + "that with a \"\" - an empty sequence has no longest word - reread README ex4.");

        Teach.Equal("london: 2, bristol: 1, leeds: 1",
            string.Join(", ", Folding.CitiesByCustomerCount(Customers())),
            "Two Londoners lead; bristol and leeds tie on 1 and are broken alphabetically - "
                + "reread README ex4.");
    }

    [Fact]
    public void Challenge_ARevenueReportFromTwoTables()
    {
        Teach.Equal("bo: 390 | ada: 165 | cy: 120",
            Revenue.TopCustomers(Customers(), Sales(), 3),
            "bo spent 300 + 90, ada 120 + 45, cy 120. Join the sales to their customers, group "
                + "by customer, sum, rank, take - reread README challenge.");

        Teach.Equal("bo: 390", Revenue.TopCustomers(Customers(), Sales(), 1),
            "Only the top spender.");

        Teach.Equal("(none)", Revenue.TopCustomers(Customers(), new List<Sale>(), 3),
            "No sales means no rows to report - zed and everyone else are absent, because a "
                + "customer with no sales does not appear - reread README challenge.");

        Teach.True(!Revenue.TopCustomers(Customers(), Sales(), 10).Contains("zed"),
            "Even asking for ten, zed has no sales and so does not appear. If zed showed up "
                + "with 0 you used GroupJoin where the prompt wanted an inner join.");
    }

    [Fact]
    public void Review1_FilteringGroupsIsHavingNotWhere()
    {
        Teach.Equal("books", string.Join(", ", Analysis.CategoriesWithAtLeast(Sales(), 3)),
            "Only books has three or more sales. The Where comes AFTER the GroupBy, so it "
                + "filters groups rather than rows - that is HAVING - reread README review.");

        Teach.Equal("books, toys", string.Join(", ", Analysis.CategoriesWithAtLeast(Sales(), 2)),
            "Both categories clear a threshold of 2.");

        Teach.Equal(0, Analysis.CategoriesWithAtLeast(Sales(), 4).Count,
            "Nothing has four sales.");

        Teach.Equal("books: 300, toys: 120", string.Join(", ", Analysis.MaxByCategory(Sales())),
            "The biggest sale within each group, categories A-Z. Max over the group, not over "
                + "everything - reread README review.");
    }
}
```

In plain English: `Ex1` checks both aggregates and the empty-sequence case.
`Ex2` compares the inner join's output with the group join's, and checks zed
appears in exactly one of them. `Ex3` flattens with and without labels and
checks that an empty child collection contributes nothing. `Ex4` folds four
sequences including the empty one that throws, then checks the grouped city
counts. `Challenge` runs the report three ways, and `Review1` is the
spaced-repetition variant.

## The teaching point

The SQL translation table is worth writing down once, because it is the whole
lesson:

```
WHERE          -> .Where(...)          before the grouping
GROUP BY       -> .GroupBy(...)
HAVING         -> .Where(...)          after the grouping
count(*)       -> group.Count()
sum(x)         -> group.Sum(s => s.X)
INNER JOIN     -> .Join(...)
LEFT JOIN      -> .GroupJoin(...)      (or GroupJoin + SelectMany + DefaultIfEmpty)
ORDER BY a, b  -> .OrderBy(a).ThenBy(b)
LIMIT / OFFSET -> .Take(n) / .Skip(n)
```

And the one that has no SQL equivalent: a LINQ group is still a sequence. You
can sort inside it, take the top three from each, or project it into a nested
shape — none of which plain `GROUP BY` can do.

The habit to carry into a .NET job is to keep asking *where the work happens*.
The exact same chain over a `List<Sale>` runs in memory as delegates; over an
EF Core `DbSet<Sale>` it becomes a `SELECT ... GROUP BY` and runs in Postgres.
Written badly — materialising with `.ToList()` too early, or calling a method
EF cannot translate — it quietly turns into "fetch the whole table, then group
in C#". That is the same N+1 conversation the SQL course had, and it starts
with knowing which of the two worlds your query is in.

Next: **12_exceptions**, where things go wrong on purpose.
