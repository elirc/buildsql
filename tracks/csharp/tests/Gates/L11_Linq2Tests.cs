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
