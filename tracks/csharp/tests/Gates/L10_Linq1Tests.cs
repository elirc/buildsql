using System.Collections;

using CSharpDojo.L10_Linq1;

namespace CSharpDojo.Gates;

public class L10_Linq1Tests
{
    private static List<Order> Sample() => new List<Order>
    {
        new Order(1, "ada", "books", 120m, 2025),
        new Order(2, "bo", "toys", 45m, 2025),
        new Order(3, "ada", "toys", 300m, 2026),
        new Order(4, "cy", "books", 120m, 2026),
        new Order(5, "bo", "books", 90m, 2026),
    };

    /// <summary>A source that reports how many times somebody walked it.</summary>
    private sealed class CountingOrders : IEnumerable<Order>
    {
        public CountingOrders(List<Order> items) => Items = items;

        public List<Order> Items { get; }

        public int Enumerations { get; private set; }

        public IEnumerator<Order> GetEnumerator()
        {
            Enumerations++;
            return Items.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }

    [Fact]
    public void Ex1_FilterProjectAndOrder()
    {
        Teach.Equal("ada, ada, cy", string.Join(", ", Queries.NamesOfOrdersOver(Sample(), 100m)),
            "Three orders are 100 or more: 300 (ada), 120 (ada) and 120 (cy). Largest first, "
                + "and the two 120s are broken by customer name - which is what ThenBy is for. "
                + "A second OrderBy would throw the first ordering away - reread README ex1.");

        Teach.Equal("ada, ada, cy, bo, bo", string.Join(", ", Queries.NamesOfOrdersOver(Sample(), 45m)),
            "A minimum of 45 keeps the 45 itself: \"at least\" is >=, not >. Five orders, "
                + "largest first - reread README ex1.");

        Teach.Equal("ada: 300, ada: 120, bo: 90, bo: 45, cy: 120",
            string.Join(", ", Queries.SortedLabels(Sample())),
            "Customer A-Z first, then largest amount first WITHIN each customer - so ada's 300 "
                + "leads and cy comes last despite the 120 - reread README ex1.");

        Teach.Equal(0, Queries.NamesOfOrdersOver(Sample(), 1000m).Count,
            "Nothing qualifies, so the result is empty - not null, and not an exception.");
    }

    [Fact]
    public void Ex2_AskingQuestionsOfASequence()
    {
        Order? firstToy = Questions.FirstIn(Sample(), "toys");
        Teach.Equal(2, firstToy!.Id,
            "FIRST in sequence order, not smallest or largest: order 2 appears before order 3 "
                + "- reread README ex2.");

        Teach.True(Questions.FirstIn(Sample(), "shoes") is null,
            "No shoes here. FirstOrDefault returns null for a reference type rather than "
                + "throwing - First would have thrown - reread README ex2.");

        Teach.True(Questions.AnyOver(Sample(), 250m), "The 300 is over 250.");
        Teach.True(!Questions.AnyOver(Sample(), 300m), "Nothing is over 300 - the 300 itself "
            + "is not over 300. Any takes a strict comparison here because the prompt said "
            + "\"above\".");

        Teach.True(Questions.AllUnder(Sample(), 500m), "Every order is under 500.");
        Teach.True(!Questions.AllUnder(Sample(), 100m), "The 120s and the 300 are not.");
        Teach.True(Questions.AllUnder(new List<Order>(), 1m),
            "All over an EMPTY sequence is true - vacuously, because there is no "
                + "counterexample. Every language does this and it surprises people every "
                + "time - reread README ex2.");

        Teach.Equal(3, Questions.CountIn(Sample(), "books"), "Orders 1, 4 and 5 are books.");
        Teach.Equal(0, Questions.CountIn(Sample(), "shoes"), "None at all.");

        Teach.Equal("cy", Questions.WithId(Sample(), 4).Customer,
            "Single finds the one match - reread README ex2.");
        Teach.Throws<InvalidOperationException>(() => Questions.WithId(Sample(), 99),
            "There is no order 99. Single THROWS when there is not exactly one match, and "
                + "that loudness is the point: an id that matches nothing is a bug, not a "
                + "null - reread README ex2.");
    }

    [Fact]
    public void Ex3_AQueryIsAPlanUntilSomebodyRunsIt()
    {
        CountingOrders source = new CountingOrders(Sample());
        IEnumerable<Order> query = Deferred.Query(source, 100m);

        Teach.Equal(0, source.Enumerations,
            "Building the query must not read the source at all. If this is not 0 you called "
                + "ToList - reread README ex3.");

        Teach.Equal(3, query.Count(), "Three orders are 100 or more.");
        Teach.Equal(1, source.Enumerations, "Counting them walked the source once.");

        Teach.Equal(3, query.Count(), "The same query, asked again, gives the same answer...");
        Teach.Equal(2, source.Enumerations,
            "...but it walked the source AGAIN. That is the multiple-enumeration bug: over a "
                + "database or a network stream, this is two round trips. reread README ex3.");

        CountingOrders snapshotSource = new CountingOrders(Sample());
        IReadOnlyList<Order> snapshot = Deferred.Snapshot(snapshotSource, 100m);

        Teach.Equal(1, snapshotSource.Enumerations,
            "Snapshot reads the source exactly once, immediately - ToList is what does that - "
                + "reread README ex3.");
        Teach.Equal(3, snapshot.Count, "Three matching orders.");

        snapshotSource.Items.Add(new Order(6, "zed", "books", 500m, 2026));
        Teach.Equal(3, snapshot.Count,
            "A snapshot is data. Adding to the source afterwards cannot change it.");
        Teach.Equal(1, snapshotSource.Enumerations,
            "And reading the snapshot again does not touch the source at all.");

        CountingOrders liveSource = new CountingOrders(Sample());
        IEnumerable<Order> live = Deferred.Query(liveSource, 100m);
        liveSource.Items.Add(new Order(6, "zed", "books", 500m, 2026));

        Teach.Equal(4, live.Count(),
            "The live query ran AFTER the source changed, so it saw the new order. Same two "
                + "lines of code, opposite behaviour - reread README ex3.");

        CountingOrders onePass = new CountingOrders(Sample());
        (int count, decimal total) = Deferred.CountAndTotal(onePass);

        Teach.Equal(5, count, "Five orders.");
        Teach.Equal(675m, total, "120 + 45 + 300 + 120 + 90.");
        Teach.Equal(1, onePass.Enumerations,
            "Both numbers had to come from ONE pass. Calling .Count() and then .Sum() walks "
                + "the source twice - reread README ex3.");
    }

    [Fact]
    public void Ex4_SkipAndTakeArePagingAndTopN()
    {
        Teach.Equal("1, 2", string.Join(", ", Paging.PageOfIds(Sample(), 1, 2)),
            "Page 1 of size 2 is the first two ids - pages are numbered from 1, so page 1 "
                + "skips nothing - reread README ex4.");
        Teach.Equal("3, 4", string.Join(", ", Paging.PageOfIds(Sample(), 2, 2)),
            "Page 2 skips (2-1) x 2 = 2 rows.");
        Teach.Equal("5", string.Join(", ", Paging.PageOfIds(Sample(), 3, 2)),
            "The last page can be short.");
        Teach.Equal("", string.Join(", ", Paging.PageOfIds(Sample(), 9, 2)),
            "A page past the end is empty rather than an error - Skip past the end simply "
                + "yields nothing.");

        Teach.Equal("3, 1, 4", string.Join(", ", Paging.TopIds(Sample(), 3)),
            "300 first, then the two 120s with ada before cy. Order BEFORE you take - taking "
                + "first would give you three arbitrary rows - reread README ex4.");
        Teach.Equal("3", string.Join(", ", Paging.TopIds(Sample(), 1)), "Just the biggest.");
        Teach.Equal(5, Paging.TopIds(Sample(), 50).Count,
            "Asking for more than there are gives everything, without complaint.");
    }

    [Fact]
    public void Challenge_OnePipelineFromRowsToReport()
    {
        Teach.Equal("ada: 300 | cy: 120 | bo: 90", Reports.TopOfYear(Sample(), 2026, 3),
            "Filter to the year, order by amount descending with the customer as tie-break, "
                + "take 3, format each, join with \" | \" - reread README challenge.");

        Teach.Equal("ada: 120 | bo: 45", Reports.TopOfYear(Sample(), 2025, 3),
            "2025 has only two orders, so the report is shorter - no padding, no blanks.");

        Teach.Equal("ada: 300", Reports.TopOfYear(Sample(), 2026, 1),
            "count really does limit the report.");

        Teach.Equal("(none)", Reports.TopOfYear(Sample(), 1999, 3),
            "A year with no orders reports \"(none)\" - string.Join over an empty sequence "
                + "gives \"\", so this case needs a decision from you - reread README challenge.");
    }

    [Fact]
    public void Review1_DistinctFilteredProjectionsAndLaziness()
    {
        Teach.Equal("books, toys", string.Join(", ", Catalogue.CategoriesOver(Sample(), 100m)),
            "Orders of 100+ are in books (twice) and toys - Distinct collapses the repeat, and "
                + "the result is alphabetical - reread README review.");

        Teach.Equal("books, toys", string.Join(", ", Catalogue.CategoriesOver(Sample(), 45m)),
            "Every order qualifies now, and there are still only two categories.");

        Teach.Equal(0, Catalogue.CategoriesOver(Sample(), 9999m).Count, "Nothing qualifies.");

        CountingOrders source = new CountingOrders(Sample());
        IEnumerable<string> names = Catalogue.LazyNames(source);

        Teach.Equal(0, source.Enumerations,
            "Select is deferred too: building the projection reads nothing - reread README "
                + "review.");
        Teach.Equal("ada, bo, ada, cy, bo", string.Join(", ", names),
            "In source order, one name per order, duplicates and all.");
        Teach.Equal(1, source.Enumerations, "One enumeration, when you asked for it.");
    }
}
