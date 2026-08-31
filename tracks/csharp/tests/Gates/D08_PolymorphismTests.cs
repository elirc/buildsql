using CSharpDojo.D08_Polymorphism;

namespace CSharpDojo.Gates;

public class D08_PolymorphismTests
{
    [Fact]
    public void Ex1_OneLoopSeveralImplementations()
    {
        string[] rows = { "a", "b" };

        Teach.Equal("a,b", new CsvExporter().Export(rows), "The CSV form.");
        Teach.Equal("[\"a\",\"b\"]", new JsonExporter().Export(rows), "The JSON form.");

        Teach.Equal("csv=a,b|json=[\"a\",\"b\"]",
            Exporters.ExportAll(new Exporter[] { new CsvExporter(), new JsonExporter() }, rows),
            "ExportAll walks the list once and asks each exporter - there is no `if` about "
                + "which kind it is - reread README ex1.");
        Teach.Equal("json=[\"a\",\"b\"]|csv=a,b",
            Exporters.ExportAll(new Exporter[] { new JsonExporter(), new CsvExporter() }, rows),
            "...in whatever order the caller supplied.");
        Teach.Equal("", Exporters.ExportAll(Array.Empty<Exporter>(), rows),
            "No exporters means no output, not an exception.");
        Teach.Equal("json=[]", Exporters.ExportAll(new Exporter[] { new JsonExporter() },
            Array.Empty<string>()),
            "And no rows still produces a valid empty JSON array.");
    }

    [Fact]
    public void Ex2_OverridingToStringAndWhoCallsItForYou()
    {
        Teach.Equal("hi", new TextCell("hi").ToString(), "A text cell is its text.");
        Teach.Equal("3.50", new NumberCell(3.5m).ToString(), "A number cell always shows 2 decimals.");
        Teach.Equal("-", new EmptyCell().ToString(), "And an empty cell is a dash.");

        Teach.Equal("hi | 3.50 | -",
            Row.Render(new Cell[] { new TextCell("hi"), new NumberCell(3.5m), new EmptyCell() }),
            "string.Join calls ToString on each item for you, and that call is VIRTUAL - so "
                + "the right override runs without any code of yours choosing it - reread "
                + "README ex2.");

        object boxed = new NumberCell(2m);
        Teach.Equal("2.00", boxed.ToString(),
            "Even through an object-typed reference the override wins: ToString has been "
                + "virtual since object - reread README ex2.");

        Teach.Equal("", Row.Render(Array.Empty<Cell>()), "An empty row renders to nothing.");
    }

    [Fact]
    public void Ex3_APipelineOfInterchangeableSteps()
    {
        Teach.Equal(90.00m, new PercentOff(10m).Apply(100m), "10% off 100.");
        Teach.Equal(0m, new AmountOff(5m).Apply(3m),
            "Taking 5 off 3 stops at zero rather than going negative - reread README ex3.");
        Teach.Equal(9m, new RoundDownToWhole().Apply(9.99m), "Rounding down drops the fraction.");

        Teach.Equal(100m, Pipeline.Run(Array.Empty<Adjustment>(), 100m),
            "No adjustments leaves the amount alone - and that falls out of the loop rather "
                + "than needing a special case - reread README ex3.");

        Teach.Equal(85m,
            Pipeline.Run(new Adjustment[] { new PercentOff(10m), new AmountOff(5m), new RoundDownToWhole() }, 100m),
            "100 -> 90 -> 85 -> 85. Each step sees what the previous step produced - reread "
                + "README ex3.");

        Teach.Equal(8.10m,
            Pipeline.Run(new Adjustment[] { new RoundDownToWhole(), new PercentOff(10m) }, 9.99m),
            "Round first, then discount: 9.99 -> 9 -> 8.10.");
        Teach.Equal(8m,
            Pipeline.Run(new Adjustment[] { new PercentOff(10m), new RoundDownToWhole() }, 9.99m),
            "Discount first, then round: 9.99 -> 8.99 -> 8. Same steps, different order, "
                + "different answer - the pipeline is ordered on purpose - reread README ex3.");
    }

    [Fact]
    public void Ex4_VirtualDispatchVersusASwitchOverTypes()
    {
        Teach.Equal(12, Sizes.ByVirtualCall(new Crate()), "A crate holds 12.");
        Teach.Equal(36, Sizes.ByVirtualCall(new Pallet(3)), "Three crates on a pallet.");
        Teach.Equal(4, Sizes.ByVirtualCall(new Tote()),
            "...and a Tote works too, without ByVirtualCall being touched - reread README ex4.");

        Teach.Equal(12, Sizes.BySwitch(new Crate()), "The switch knows about crates...");
        Teach.Equal(36, Sizes.BySwitch(new Pallet(3)), "...and about pallets...");
        Teach.Equal(-1, Sizes.BySwitch(new Tote()),
            "...and NOT about totes, because it was written before totes existed. That is the "
                + "cost of switching on type: every new subclass is a bug in every switch "
                + "somebody forgot - reread README ex4.");

        Container held = new Pallet(2);
        Teach.Equal(24, Sizes.ByVirtualCall(held),
            "Dispatch is on the runtime type, so a Container-typed variable is no obstacle.");
    }

    [Fact]
    public void Ex5_WhenOnlySomeOfThemDoTheExtraThing()
    {
        Job[] jobs = { new SimpleJob("a"), new RetryableJob("b", 3), new SimpleJob("c") };

        Teach.Equal("done", jobs[0].Run(), "Both kinds run the same way...");
        Teach.Equal("done", jobs[1].Run(), "...which is why Run is on the base class.");

        Teach.Equal("a, b (retries 3), c", Runner.Describe(jobs),
            "Only the retryable one gets the extra text, and `job is RetryableJob r` tests and "
                + "converts in one step - reread README ex5.");
        Teach.Equal(1, Runner.CountRetryable(jobs), "One of the three.");

        Job hidden = new RetryableJob("d", 5);
        Teach.Equal(1, Runner.CountRetryable(new[] { hidden }),
            "The variable is typed Job and the OBJECT is a RetryableJob - `is` asks about the "
                + "object - reread README ex5.");
        Teach.Equal("d (retries 5)", Runner.Describe(new[] { hidden }), "...and so does Describe.");

        Teach.Equal("", Runner.Describe(Array.Empty<Job>()), "Nothing to describe.");
        Teach.Equal(0, Runner.CountRetryable(Array.Empty<Job>()), "Nothing to count.");
    }

    [Fact]
    public void Ex6_ABagOfRulesAllTheSameShape()
    {
        Rule[] rules = { new NotBlank(), new MaxLength(5), new DigitsOnly() };

        Teach.Equal("", Validation.FirstError(rules, "123"), "All three rules pass.");
        Teach.Equal("must not be blank", Validation.FirstError(rules, ""),
            "The FIRST rule to complain wins, and the rest are not even asked - reread "
                + "README ex6.");
        Teach.Equal("must be at most 5 characters", Validation.FirstError(rules, "123456"),
            "Not blank, so the length rule is the first to object.");
        Teach.Equal("must be digits only", Validation.FirstError(rules, "12a"),
            "Not blank and short enough, so the third rule objects.");

        Teach.Equal("must be at most 5 characters; must be digits only",
            Validation.AllErrors(rules, "abcdef"),
            "AllErrors keeps asking, so a form can show every problem at once - reread "
                + "README ex6.");
        Teach.Equal("must not be blank; must be digits only", Validation.AllErrors(rules, "  "),
            "Two spaces are blank AND not digits - but they are short enough.");
        Teach.Equal("", Validation.AllErrors(rules, "12"), "Nothing to say.");

        Teach.Equal("", Validation.FirstError(Array.Empty<Rule>(), "anything"),
            "No rules means nothing to complain about.");
        Teach.True(new DigitsOnly().Check("") is null,
            "Empty text passes the digits rule vacuously - every one of its zero characters is "
                + "a digit, and a passing rule returns null. Keeping each rule to ONE job is "
                + "what lets them combine - reread README ex6.");
    }

    [Fact]
    public void Ex7_AChainWhereEachLinkDecidesWhatHappensNext()
    {
        Middleware chain = new TagMiddleware(new UpperMiddleware(new BlockMiddleware(null)));

        Teach.Equal("<HI>", chain.Handle("hi"),
            "Tag passes the request on, Upper upper-cases it, Block lets it through, and then "
                + "the answer comes back OUT through the tag - reread README ex7.");
        Teach.Equal("<BLOCKED>", chain.Handle("bad news"),
            "Block returns without calling Continue, so nothing further down runs - but the "
                + "links ABOVE it still see the answer on the way back - reread README ex7.");

        Teach.Equal("ok", new BlockMiddleware(null).Handle("ok"),
            "The last link in a chain has no Next, and Continue simply hands the request back "
                + "- reread README ex7.");
        Teach.Equal("OK", new UpperMiddleware(null).Handle("ok"), "One link on its own still works.");
        Teach.Equal("<<x>>", new TagMiddleware(new TagMiddleware(null)).Handle("x"),
            "The same class twice in a chain nests, because each instance only knows its own "
                + "Next - reread README ex7.");
        Teach.Equal("BLOCKED", new BlockMiddleware(new UpperMiddleware(null)).Handle("BAD"),
            "The block test ignores case, so the shouting version is caught too.");
    }

    [Fact]
    public void Ex8_ARegistryThatDispatchesByName()
    {
        CommandBus bus = new CommandBus();
        bus.Register(new EchoCommand()).Register(new UpperCommand());
        bus.Register(new HelpCommand(bus));

        Teach.Equal("echo, help, upper", string.Join(", ", bus.Names),
            "Three commands, sorted - a Dictionary promises no order of its own - reread "
                + "README ex8.");

        Teach.Equal("hello world", bus.Run("echo hello world"),
            "The line splits at the FIRST space, so the rest is one argument - reread README ex8.");
        Teach.Equal("HI", bus.Run("upper hi"), "A different command, same dispatch.");
        Teach.Equal("HI", bus.Run("UPPER hi"),
            "The command word is matched in lower case, so the user's capitals do not matter.");
        Teach.Equal("", bus.Run("echo"),
            "A command with no argument gets \"\" rather than crashing - reread README ex8.");
        Teach.Equal("echo, help, upper", bus.Run("help"),
            "help asks the bus what it holds - a command holding a reference to its own "
                + "registry is how a plugin lists its neighbours - reread README ex8.");

        Teach.Equal("unknown command: nope", bus.Run("nope"),
            "An unregistered word is reported, not ignored - reread README ex8.");
        Teach.Equal("unknown command: ", bus.Run("   "), "And a blank line names nothing.");

        bus.Register(new EchoCommand());
        Teach.Equal(3, bus.Names.Count,
            "Registering the same NAME again replaces rather than duplicating - reread "
                + "README ex8.");
    }
}
