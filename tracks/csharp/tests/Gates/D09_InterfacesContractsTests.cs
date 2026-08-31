using CSharpDojo.D09_InterfacesContracts;

namespace CSharpDojo.Gates;

public class D09_InterfacesContractsTests
{
    [Fact]
    public void Ex1_OneContractThreeUnrelatedImplementers()
    {
        Teach.Equal(4, new Paragraph("the quick brown fox").Words, "Four words.");
        Teach.Equal(4, new Paragraph("  the   quick brown\nfox  ").Words,
            "Any run of whitespace separates words, and the ends do not add empty ones "
                + "- reread README ex1.");
        Teach.Equal(0, new Paragraph("").Words, "Empty text is no words.");
        Teach.Equal(0, new Paragraph("   ").Words, "So is whitespace.");
        Teach.Equal(1, new Heading("Introduction", 1).Words, "A heading counts its title.");
        Teach.Equal(0, new ImageBlock("a.png").Words, "A picture is not words.");

        IWordCount[] parts =
        {
            new Paragraph("a b"),
            new Heading("Title Here", 1),
            new ImageBlock("x.png"),
        };

        Teach.Equal(4, Document.Total(parts),
            "2 + 2 + 0. Three unrelated types - one of them a STRUCT - go in the same array "
                + "because they share an interface, not a base class - reread README ex1.");
        Teach.Equal(2, Document.Largest(parts), "The largest single part.");
        Teach.Equal(0, Document.Total(Array.Empty<IWordCount>()), "Nothing sums to nothing.");
        Teach.Equal(0, Document.Largest(Array.Empty<IWordCount>()),
            "...and the largest of nothing is 0 rather than an exception - reread README ex1.");
    }

    [Fact]
    public void Ex2_TheOrderingAsASeparateObject()
    {
        List<Track> tracks = new List<Track>
        {
            new Track("beta", 200),
            new Track("Alpha", 100),
            new Track("gamma", 100),
        };

        Teach.Equal("Alpha, gamma, beta", Playlist.Ordered(tracks, new ByLength()),
            "Shortest first; the two 100s tie and are broken by title ORDINALLY, where a "
                + "capital A sorts before a lower-case g - reread README ex2.");
        Teach.Equal("Alpha, beta, gamma", Playlist.Ordered(tracks, new ByTitle()),
            "The same tracks, a different comparer, a different order - and neither comparer "
                + "is a method on Track - reread README ex2.");

        Teach.Equal("beta, Alpha, gamma", string.Join(", ", tracks.Select(t => t.Title)),
            "The caller's list came back in its original order: Ordered sorts a COPY "
                + "- reread README ex2.");

        Teach.Equal("", Playlist.Ordered(Array.Empty<Track>(), new ByTitle()),
            "Sorting nothing is nothing.");
        Teach.Equal(0, new ByLength().Compare(new Track("x", 5), new Track("x", 5)),
            "Two equal tracks compare as 0 - a comparer that never returns 0 breaks every "
                + "sort that relies on it - reread README ex2.");
        Teach.True(new ByTitle().Compare(new Track("a", 1), new Track("B", 1)) < 0,
            "By title, ignoring case, 'a' comes before 'B'.");
    }

    [Fact]
    public void Ex3_TwoContractsOneClassNarrowParameters()
    {
        MemoryDoc doc = new MemoryDoc();
        Teach.Equal(0, Docs.LengthOf(doc), "A new document is empty.");

        doc.Write("ab");
        Teach.Equal("ab", doc.Read(), "Writing appends.");
        Teach.Equal(2, Docs.LengthOf(doc), "...and LengthOf takes the READING interface.");

        Docs.Exclaim(doc);
        Teach.Equal("ab!", doc.Read(), "Exclaim takes the WRITING interface.");

        FrozenDoc frozen = new FrozenDoc("hello");
        Teach.Equal(5, Docs.LengthOf(frozen),
            "A FrozenDoc implements only the reading half, and LengthOf asks for no more than "
                + "it needs - which is why it is accepted - reread README ex3.");

        Teach.True(Docs.CanWrite(doc),
            "A MemoryDoc held as IReadableDoc is still a MemoryDoc - reread README ex3.");
        Teach.True(!Docs.CanWrite(frozen), "...and a FrozenDoc is still not writable.");

        IReadableDoc asReadable = doc;
        Teach.True(Docs.CanWrite(asReadable),
            "`is` asks about the object, so narrowing the variable's type changes nothing.");
    }

    [Fact]
    public void Ex4_ExplicitImplementationHidesAMember()
    {
        Customer customer = new Customer("Ada", "ada@x");

        Teach.Equal("Ada <ada@x>", customer.Describe(), "The ordinary public member.");

        IPersistable persistable = customer;
        Teach.Equal("Ada|ada@x", persistable.ToRow(),
            "The explicit implementation is reached through the INTERFACE - reread README ex4.");
        Teach.Equal(2, persistable.Version, "...and so is the property.");
        Teach.Equal("2|Ada|ada@x", Persistence.Save(customer),
            "A method taking IPersistable converts the Customer for you.");

        Teach.True(typeof(Customer).GetMethod("ToRow") is null,
            "ToRow must NOT appear on Customer's own public surface - that is what explicit "
                + "implementation is for, and it is why an IntelliSense list for Customer stays "
                + "about customers - reread README ex4.");
        Teach.True(typeof(Customer).GetMethod("Describe") is not null,
            "...while the ordinary member is exactly where you would expect it.");
    }

    [Fact]
    public void Ex5_ADefaultImplementationAndWhereItLives()
    {
        string[] rows = { "a", "b" };

        IReportable sales = new SalesReport("Q1", rows);
        Teach.Equal("Q1: 2 row(s)", sales.Summary(),
            "SalesReport says nothing about Summary, so the INTERFACE's body runs - reread "
                + "README ex5.");
        Teach.Equal("Q1: 2 row(s)", Reports.SummaryOf(sales), "...through a helper as well.");

        TerseReport terse = new TerseReport("Q1", rows);
        Teach.Equal("Q1/2", terse.Summary(), "TerseReport supplies its own.");
        Teach.Equal("Q1/2", Reports.SummaryOf(terse),
            "...and it wins through the interface too - a class member always beats the "
                + "interface's default - reread README ex5.");

        Teach.True(typeof(SalesReport).GetMethod("Summary") is null,
            "SalesReport has no Summary member of its own. A default interface method is NOT "
                + "inherited into the class - you can only call it through the interface "
                + "- reread README ex5.");
        Teach.True(typeof(TerseReport).GetMethod("Summary") is not null,
            "...whereas TerseReport declared one, so it has it both ways.");
    }

    [Fact]
    public void Ex6_IDisposableAndAScopeThatOwnsOthers()
    {
        List<string> log = new List<string>();
        Scope scope = new Scope();
        Resource first = new Resource("a", log);
        Resource second = new Resource("b", log);

        scope.Add(first);
        scope.Add(second);
        Teach.Equal(0, log.Count, "Nothing is disposed until the scope is.");

        scope.Dispose();
        Teach.Equal("dispose b, dispose a", string.Join(", ", log),
            "LAST added, FIRST disposed - because a later resource may depend on an earlier "
                + "one, exactly as nested `using` blocks unwind - reread README ex6.");
        Teach.True(first.Disposed && second.Disposed, "Both children know they are disposed.");

        scope.Dispose();
        Teach.Equal(2, log.Count,
            "Disposing the scope twice must be harmless - reread README ex6.");

        second.Dispose();
        Teach.Equal(2, log.Count,
            "...and so must disposing a child again, which is the whole reason each Dispose "
                + "guards itself - reread README ex6.");

        Teach.Throws<ObjectDisposedException>(() => scope.Add(new Resource("c", log)),
            "Adding to a scope that has already unwound would leak, so it is refused "
                + "- reread README ex6.");

        Scope empty = new Scope();
        empty.Dispose();
        Teach.True(empty.Disposed, "An empty scope disposes cleanly.");
    }

    [Fact]
    public void Ex7_SplitTheContractConstrainTheParameter()
    {
        MemoryStore<Note> store = new MemoryStore<Note>();

        Teach.Equal("0 item(s)", Catalogue.Describe(store), "A new store is empty.");
        Teach.Equal("", Catalogue.Ids(store), "...with no ids in it.");

        store.Save(new Note("b", "two"));
        store.Save(new Note("a", "one"));

        Teach.Equal(2, store.Count, "Two notes.");
        Teach.Equal("a,b", Catalogue.Ids(store),
            "Ids reads .Id from a T it knows nothing else about - the `where T : IHasId` "
                + "constraint is what makes that legal - reread README ex7.");
        Teach.Equal("one", store.Find("a")?.Text ?? "", "Found by id.");
        Teach.True(store.Find("zz") is null, "A missing id is null, not an exception.");

        store.Save(new Note("a", "again"));
        Teach.Equal(2, store.Count, "Saving an existing id replaces rather than adding.");
        Teach.Equal("again", store.Find("a")?.Text ?? "", "...with the newer value.");

        Teach.True(store.Delete("a"), "Deleting something that is there reports true.");
        Teach.Equal(1, store.Count, "...and it is gone.");
        Teach.True(!store.Delete("a"), "Deleting it again reports false.");

        IReadStore<Note> reader = store;
        Teach.Equal("1 item(s)", Catalogue.Describe(reader),
            "A consumer that only reads asks for only the reading half - reread README ex7.");

        IWriteStore<Note> writer = store;
        writer.Save(new Note("c", "three"));
        Teach.Equal(2, store.Count,
            "...and the same object satisfies both interfaces, so the write is visible to the "
                + "reader - reread README ex7.");
    }

    [Fact]
    public void Ex8_ADecoratorWearsTheSameContract()
    {
        Dictionary<string, decimal> prices = new Dictionary<string, decimal> { ["a"] = 1.50m };
        TablePriceSource table = new TablePriceSource(prices);
        CachingPriceSource caching = new CachingPriceSource(table);

        Teach.Equal(1.50m, caching.PriceOf("a"), "The first ask comes back correct...");
        Teach.Equal(1, table.Lookups, "...having reached the inner source once.");
        Teach.Equal(1, caching.Misses, "...which is a miss.");
        Teach.Equal(0, caching.Hits, "Nothing was cached yet.");

        Teach.Equal(1.50m, caching.PriceOf("a"), "The second ask is the same answer...");
        Teach.Equal(1, table.Lookups,
            "...without troubling the inner source at all - reread README ex8.");
        Teach.Equal(1, caching.Hits, "...because it was a hit.");

        Teach.Throws<KeyNotFoundException>(() => caching.PriceOf("zz"),
            "The decorator passes failures straight through rather than inventing a price "
                + "- reread README ex8.");
        Teach.Equal(2, table.Lookups, "...having asked the inner source.");
        Teach.Throws<KeyNotFoundException>(() => caching.PriceOf("zz"), "And it fails again...");
        Teach.Equal(3, table.Lookups,
            "...asking again, because a FAILED lookup must not be cached - otherwise adding "
                + "the missing price would never take effect - reread README ex8.");

        IPriceSource asInterface = caching;
        Teach.Equal(1.50m, asInterface.PriceOf("a"),
            "A caller holding the interface cannot tell the decorator from the real thing - "
                + "which is the entire point of the pattern - reread README ex8.");
        Teach.Equal(2, caching.Hits, "...and it was still served from the cache.");
    }
}
