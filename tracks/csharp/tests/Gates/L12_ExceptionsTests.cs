using CSharpDojo.L12_Exceptions;

namespace CSharpDojo.Gates;

public class L12_ExceptionsTests
{
    [Fact]
    public void Ex1_FinallyRunsOnBothPaths()
    {
        Teach.Equal(5, Basics.SafeDivide(10, 2, -1), "10 / 2 is 5 - the ordinary path.");
        Teach.Equal(-1, Basics.SafeDivide(10, 0, -1),
            "Integer division by zero throws DivideByZeroException; catching it and returning "
                + "the fallback is the whole method - reread README ex1.");

        Teach.Equal("try, after, finally", string.Join(", ", Basics.Trace(shouldThrow: false)),
            "With nothing thrown, the catch block never runs and finally still does - reread "
                + "README ex1.");

        Teach.Equal("try, catch, finally", string.Join(", ", Basics.Trace(shouldThrow: true)),
            "The throw skips the rest of the try block - \"after\" never happens - then the "
                + "catch runs, and finally runs last either way - reread README ex1.");
    }

    [Fact]
    public void Ex2_YourExceptionKeepsTheOriginalCause()
    {
        Teach.Equal(8080, Configuration.LoadPort("8080"), "A good value parses normally.");

        ConfigurationException bad = Teach.Throws<ConfigurationException>(
            () => Configuration.LoadPort("abc"),
            "Unparseable configuration should surface as YOUR exception type, not as a raw "
                + "FormatException from somewhere deep inside - reread README ex2.");

        Teach.Equal("bad port: abc", bad.Message,
            "The message names the offending value, so a log line is enough to diagnose it.");
        Teach.True(bad.InnerException is FormatException,
            "The original FormatException must be kept as the InnerException. Dropping it "
                + "throws away the stack trace that says where it actually happened - pass it "
                + "to the base constructor - reread README ex2.");

        ConfigurationException missing = Teach.Throws<ConfigurationException>(
            () => Configuration.LoadPort(null),
            "Null is also unparseable configuration.");

        Teach.Equal("bad port: null", missing.Message,
            "With no text at all the message says \"null\" rather than being blank.");
        Teach.True(missing.InnerException is ArgumentNullException,
            "int.Parse(null) throws ArgumentNullException, not FormatException - and whatever "
                + "it threw is what the InnerException must be. If this failed, you caught one "
                + "specific type and missed the other.");
    }

    [Fact]
    public void Ex3_FiltersDecideWhichCatchWins()
    {
        Teach.Equal("ok", Classifier.Attempt(() => { }),
            "Nothing thrown, nothing to classify - reread README ex3.");

        Teach.Equal("retry", Classifier.Attempt(() => throw new TransientException("busy", 503)),
            "503 is 500 or above, so this one is worth retrying. A `when` filter on the catch "
                + "clause is how you split one exception type by its data - reread README ex3.");

        Teach.Equal("give up", Classifier.Attempt(() => throw new TransientException("bad request", 400)),
            "400 is the caller's fault and will not fix itself. Same type, different answer, "
                + "decided by the filter - reread README ex3.");

        Teach.Throws<InvalidOperationException>(
            () => Classifier.Attempt(() => throw new InvalidOperationException("bug")),
            "Anything that is not a TransientException must travel on untouched. A catch-all "
                + "here would swallow real bugs and report them as \"give up\" - reread "
                + "README ex3.");
    }

    [Fact]
    public void Ex4_DisposeHappensWhateverElseDoes()
    {
        Teach.Equal("open, use, finished, dispose", string.Join(", ", Session.Run(shouldThrow: false)),
            "A `using` declaration disposes at the end of its enclosing block - so \"finished\" "
                + "comes first and the cleanup last - reread README ex4.");

        Teach.Equal("open, use, dispose, caught", string.Join(", ", Session.Run(shouldThrow: true)),
            "When the throw happens, the resource is disposed as the stack unwinds - BEFORE "
                + "the catch outside it runs. That ordering is the whole reason using exists - "
                + "reread README ex4.");

        List<string> log = new List<string>();
        Resource resource = new Resource(log);
        resource.Dispose();
        resource.Dispose();

        Teach.Equal("open, dispose", string.Join(", ", log),
            "Dispose must be safe to call twice: the second call does nothing at all. Guard on "
                + "a bool field - reread README ex4.");
    }

    [Fact]
    public void Challenge_RetryOnlyWhatIsWorthRetrying()
    {
        (int attempts, int value, string outcome) = Resilient.Run(() => 42, 3);

        Teach.Equal(1, attempts, "It worked first time - reread README challenge.");
        Teach.Equal(42, value, "...and the value comes back with it.");
        Teach.Equal("ok", outcome, "Success is reported as \"ok\".");

        int calls = 0;
        (int lateAttempts, int lateValue, string lateOutcome) = Resilient.Run(
            () =>
            {
                calls++;
                if (calls < 3)
                {
                    throw new TransientException("busy", 503);
                }

                return 7;
            },
            5);

        Teach.Equal(3, lateAttempts, "Two failures then a success is three attempts.");
        Teach.Equal(7, lateValue, "The value from the attempt that worked.");
        Teach.Equal("ok", lateOutcome, "Recovering counts as success.");

        int hopeless = 0;
        (int outAttempts, int outValue, string outOutcome) = Resilient.Run(
            () =>
            {
                hopeless++;
                throw new TransientException("still busy", 503);
            },
            3);

        Teach.Equal(3, hopeless, "maxAttempts means exactly that many calls - not one more, "
            + "not one fewer - reread README challenge.");
        Teach.Equal(3, outAttempts, "The attempt count comes back so a caller can log it.");
        Teach.Equal(0, outValue, "There is no value to report.");
        Teach.Equal("exhausted", outOutcome, "Giving up is reported, not thrown.");

        int fatalCalls = 0;
        Teach.Throws<InvalidOperationException>(
            () => Resilient.Run(
                () =>
                {
                    fatalCalls++;
                    throw new InvalidOperationException("bug");
                },
                5),
            "A non-transient failure is a bug, and retrying a bug five times just makes five "
                + "identical stack traces. Let it out - reread README challenge.");
        Teach.Equal(1, fatalCalls,
            "...and let it out IMMEDIATELY: the work must have been called exactly once.");
    }
}
