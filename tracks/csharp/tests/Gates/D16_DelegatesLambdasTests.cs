using CSharpDojo.D16_DelegatesLambdas;

namespace CSharpDojo.Gates;

public class D16_DelegatesLambdasTests
{
    [Fact]
    public void Ex1_AMethodHandedBackAsAValue()
    {
        Func<int, int, int> add = Ops.ForName("add");
        Teach.Equal(5, add(2, 3),
            "ForName returns the operation itself, and the caller invokes it with () like any "
                + "other method - reread README ex1.");
        Teach.Equal(-1, Ops.ForName("sub")(2, 3), "sub is first minus second, in that order.");
        Teach.Equal(42, Ops.ForName("mul")(6, 7), "mul multiplies.");

        Teach.Throws<ArgumentException>(() => Ops.ForName("div"),
            "An unknown name has no operation to hand back, so ForName throws ArgumentException "
                + "rather than returning null - reread README ex1.");

        Teach.Equal(16, Ops.Twice(x => x + 3, 10),
            "Twice feeds its own result back in: 10 becomes 13 becomes 16. Applying the "
                + "transform once and doubling the answer is the classic wrong reading - reread "
                + "README ex1.");
        Teach.Equal(81, Ops.Twice(x => x * x, 3), "3 squared is 9, and 9 squared is 81.");
        Teach.Equal(7, Ops.Twice(x => x, 7), "The identity transform changes nothing, twice.");

        Func<int, int, int> mul = Ops.ForName("mul");
        Teach.Equal(20, Ops.Twice(x => mul(x, 2), 5),
            "A delegate returned by one method can be wrapped in a lambda and passed to "
                + "another - behaviour travels like data - reread README ex1.");
    }

    [Fact]
    public void Ex2_PredicatesCombinedAndShortCircuited()
    {
        Func<int, bool> positive = n => n > 0;
        Func<int, bool> even = n => n % 2 == 0;

        Func<int, bool> positiveAndEven = Predicates.Both(positive, even);
        Teach.True(positiveAndEven(4), "4 is positive and even.");
        Teach.True(!positiveAndEven(3), "3 is positive but not even.");
        Teach.True(!positiveAndEven(-2), "-2 is even but not positive.");
        Teach.True(!positiveAndEven(-3), "-3 is neither.");

        Func<int, bool> positiveOrEven = Predicates.Either(positive, even);
        Teach.True(positiveOrEven(3), "3 clears the first rule.");
        Teach.True(positiveOrEven(-2), "-2 clears the second.");
        Teach.True(!positiveOrEven(-3), "-3 clears neither.");

        int secondCalls = 0;
        Func<int, bool> counted = n =>
        {
            secondCalls++;
            return true;
        };

        Predicates.Both(n => false, counted)(1);
        Teach.Equal(0, secondCalls,
            "Both must short-circuit: once the first predicate says no the answer is already no, "
                + "so the second must not run at all. Calling both and then combining the two "
                + "bools with & is the mistake this checks for - reread README ex2.");

        Predicates.Both(n => true, counted)(1);
        Teach.Equal(1, secondCalls, "When the first says yes the second does have to be asked.");

        secondCalls = 0;
        Predicates.Either(n => true, counted)(1);
        Teach.Equal(0, secondCalls,
            "Either short-circuits the other way round: a yes from the first settles it - reread "
                + "README ex2.");

        Predicates.Either(n => false, counted)(1);
        Teach.Equal(1, secondCalls, "And a no from the first means the second decides.");

        Func<string, bool> shortText =
            Predicates.Both<string>(s => s.Length < 5, s => s.StartsWith("a"));
        Teach.True(shortText("abc"), "The combinators are generic, so they work on strings too.");
        Teach.True(!shortText("abcdef"), "Too long.");
    }

    [Fact]
    public void Ex3_AFactoryThatClosesOverItsParameter()
    {
        Func<decimal, decimal> quarterOff = Factories.MakeDiscounter(0.25m);
        Teach.Equal(75m, quarterOff(100m),
            "A 0.25 rate takes a quarter OFF, so 100 becomes 75 - returning 25 means you built "
                + "the discount rather than the discounted price - reread README ex3.");
        Teach.Equal(60m, quarterOff(80m), "The same function works on any price.");

        Func<decimal, decimal> tenOff = Factories.MakeDiscounter(0.10m);
        Teach.Equal(90m, tenOff(100m), "A second factory call makes a second, independent rate.");
        Teach.Equal(75m, quarterOff(100m),
            "...and making it did not disturb the first one: each call to MakeDiscounter captures "
                + "its OWN rate - reread README ex3.");

        decimal rate = 0.5m;
        Func<decimal, decimal> halfOff = Factories.MakeDiscounter(rate);
        rate = 0.9m;
        Teach.Equal(50m, halfOff(100m),
            "The lambda captured the PARAMETER, which is a fresh variable holding a copy of the "
                + "argument - so changing the caller's variable afterwards cannot reach it. "
                + "Capturing a loop variable is the case where that protection is missing - "
                + "reread README ex3.");

        Func<string, string> urgent = Factories.MakeTagger("urgent");
        Teach.Equal("[urgent] reboot", urgent("reboot"),
            "One space between the bracketed tag and the message - reread README ex3.");
        Teach.Equal("[debug] reboot", Factories.MakeTagger("debug")("reboot"),
            "A different tag, and the first tagger is untouched.");
        Teach.Equal("[urgent] disk full", urgent("disk full"), "The tag stays, the message varies.");
    }

    [Fact]
    public void Ex4_WrappersThatRememberSomething()
    {
        int runs = 0;
        Action count = () => runs++;

        Action once = Guards.Once(count);
        once();
        once();
        once();
        Teach.Equal(1, runs,
            "Once runs the wrapped action on the first call and swallows every call after that. "
                + "The flag has to live in the closure, not in a static field - reread README ex4.");

        Action anotherOnce = Guards.Once(count);
        anotherOnce();
        Teach.Equal(2, runs,
            "A SECOND wrapper around the same action has its own flag, so it gets its own first "
                + "call. A static or shared flag would leave this at 1 - reread README ex4.");
        anotherOnce();
        Teach.Equal(2, runs, "...and that second wrapper is spent too.");

        runs = 0;
        Action after = Guards.After(3, count);
        after();
        after();
        Teach.Equal(0, runs, "Calls one and two are swallowed.");
        after();
        Teach.Equal(1, runs,
            "Call number THREE is the one that runs - After(3, ...) counts the call it fires on - "
                + "reread README ex4.");
        after();
        after();
        Teach.Equal(3, runs,
            "...and every call from there on runs as well: After is a warm-up, not a one-shot - "
                + "reread README ex4.");

        runs = 0;
        Action immediately = Guards.After(1, count);
        immediately();
        Teach.Equal(1, runs, "After(1, ...) fires on the very first call.");
    }

    [Fact]
    public void Ex5_ComparisonsBuiltOutOfComparisons()
    {
        List<string> words = new List<string> { "pear", "fig", "banana", "kiwi", "plum" };

        Comparison<string> byLength = Comparers.ByKey<string>(w => w.Length);
        List<string> shortestFirst = new List<string>(words);
        shortestFirst.Sort(byLength);
        Teach.Equal("3|4|4|4|6", string.Join("|", shortestFirst.Select(w => w.Length)),
            "ByKey applies the key function to both operands and compares the KEYS, ascending - "
                + "so the lengths come out in order. Only the lengths are checked, because "
                + "List.Sort makes no promise about the order of tied items - reread README ex5.");

        List<string> longestFirst = new List<string>(words);
        longestFirst.Sort(Comparers.Reversed(byLength));
        Teach.Equal("6|4|4|4|3", string.Join("|", longestFirst.Select(w => w.Length)),
            "Reversed swaps the operands rather than negating the result - negating breaks on "
                + "int.MinValue, which a Comparison is allowed to return - reread README ex5.");

        Comparison<string> byLengthThenAlpha =
            Comparers.Then(byLength, (a, b) => string.CompareOrdinal(a, b));
        List<string> tidy = new List<string>(words);
        tidy.Sort(byLengthThenAlpha);
        Teach.Equal("fig|kiwi|pear|plum|banana", string.Join("|", tidy),
            "Then only consults the second comparison when the first answered 0, so the "
                + "four-letter words are now alphabetical among themselves while the overall "
                + "order is still by length - reread README ex5.");

        Teach.Equal(0, byLength("pear", "plum"), "Equal keys compare equal - that is the tie.");
        Teach.True(byLengthThenAlpha("pear", "plum") < 0, "...and the tiebreaker settles it.");
        Teach.True(Comparers.Then<string>((a, b) => 1, (a, b) => -1)("x", "y") > 0,
            "When the first comparison has an opinion the second is never consulted - reread "
                + "README ex5.");

        List<int> numbers = new List<int> { 3, -7, 5, -1 };
        numbers.Sort(Comparers.ByKey<int>(Math.Abs));
        Teach.Equal("-1|3|5|-7", string.Join("|", numbers),
            "The key does not have to be a property - any int-valued function will do.");
    }

    [Fact]
    public void Ex6_TwoLambdasOverOneVariable()
    {
        (Action<int> Deposit, Func<int> Balance) account = Accounts.MakeAccount(100);

        Teach.Equal(100, account.Balance(),
            "The opening balance is the captured local's starting value - reread README ex6.");

        account.Deposit(25);
        Teach.Equal(125, account.Balance(),
            "Deposit and Balance close over the SAME local variable, so what one writes the other "
                + "reads. If Balance still says 100, each lambda captured its own copy - which "
                + "means you passed the value in instead of sharing the variable - reread "
                + "README ex6.");

        account.Deposit(0);
        Teach.Equal(125, account.Balance(), "A zero deposit is allowed and changes nothing.");

        (Action<int> Deposit, Func<int> Balance) other = Accounts.MakeAccount(0);
        other.Deposit(7);
        Teach.Equal(7, other.Balance(), "The second account keeps its own balance...");
        Teach.Equal(125, account.Balance(),
            "...and the first is untouched: each CALL to MakeAccount creates a fresh local for "
                + "its pair of lambdas to share - reread README ex6.");

        Teach.Throws<ArgumentOutOfRangeException>(() => account.Deposit(-1),
            "The guard lives inside the lambda, because the lambda is the only door to the "
                + "balance - reread README ex6.");
        Teach.Equal(125, account.Balance(),
            "...and the refused deposit left the balance alone: throw before you add, not after.");
    }

    [Fact]
    public void Ex7_BindFlipAndPipe()
    {
        Func<int, int, int> divide = (a, b) => a / b;

        Func<int, int> hundredOver = Currying.Bind(divide, 100);
        Teach.Equal(25, hundredOver(4),
            "Bind fixes the FIRST argument, so the remaining function takes the second: 100 / 4. "
                + "Getting 4 / 100 (which is 0) means you bound the wrong side - reread README ex7.");
        Teach.Equal(10, hundredOver(10), "The fixed 100 stays fixed.");

        Func<int, int, int> flipped = Currying.Flip(divide);
        Teach.Equal(25, flipped(4, 100),
            "Flip swaps the parameters: flipped(4, 100) is divide(100, 4) - reread README ex7.");
        Teach.Equal(4, Currying.Flip(Currying.Flip(divide))(100, 25),
            "Flipping twice gets you back where you started.");

        Func<string, int, string> repeat = (text, times) => string.Concat(Enumerable.Repeat(text, times));
        Teach.Equal("abababab", Currying.Flip(repeat)(4, "ab"),
            "Flip is generic in both parameter types, so the two need not match - reread "
                + "README ex7.");

        Func<int, string> describe = Currying.Pipe<int, int, string>(n => n * 2, n => $"value={n}");
        Teach.Equal("value=42", describe(21),
            "Pipe(f, g) runs f FIRST and feeds its result to g - g(f(x)), not f(g(x)). The type "
                + "parameters spell out the order: f ends in TMid and g starts there - reread "
                + "README ex7.");

        Func<string, int> lengthOfTag = Currying.Pipe<string, string, int>(s => $"[{s}]", s => s.Length);
        Teach.Equal(5, lengthOfTag("abc"), "Three characters plus two brackets.");

        Func<int, int> addTen = Currying.Bind<int, int, int>((a, b) => a + b, 10);
        Func<int, int> plumbing = Currying.Pipe(addTen, hundredOver);
        Teach.Equal(4, plumbing(15),
            "15 plus ten is 25, and 100 over 25 is 4. The three combinators compose with each "
                + "other because each one only ever returns another function - reread README ex7.");
    }

    [Fact]
    public void Ex8_ARulesEngineMadeOfPredicates()
    {
        Validator<Signup> validator = new Validator<Signup>()
            .Require("name is required", s => s.Name.Length > 0)
            .Require("name is too long", s => s.Name.Length <= 10)
            .Require("must be 18 or over", s => s.Age >= 18);

        Teach.True(validator.IsValid(new Signup("Ada", 36)),
            "Every rule passes, so there is nothing to report - reread README ex8.");
        Teach.Equal(0, validator.Check(new Signup("Ada", 36)).Count, "...and Check agrees.");

        Teach.Equal("must be 18 or over",
            string.Join(" | ", validator.Check(new Signup("Ada", 12))),
            "Only the failing rule's message comes back - a rule that PASSES reports nothing, so "
                + "the predicate answers true for GOOD data - reread README ex8.");

        Teach.Equal("name is required | must be 18 or over",
            string.Join(" | ", validator.Check(new Signup("", 12))),
            "Two failures, in the order the rules were registered - not alphabetical, and not "
                + "stopping at the first one - reread README ex8.");

        Teach.True(!validator.IsValid(new Signup("Bartholomew", 40)),
            "Eleven characters trips the length rule even though the other two pass.");
        Teach.Equal("name is too long",
            string.Join(" | ", validator.Check(new Signup("Bartholomew", 40))),
            "...and the message names which rule - reread README ex8.");

        Validator<Signup> empty = new Validator<Signup>();
        Teach.True(empty.IsValid(new Signup("", -1)),
            "A validator with no rules cannot fail anything: an empty failure list is a PASS - "
                + "reread README ex8.");

        Validator<Signup> chained = new Validator<Signup>();
        Validator<Signup> returned = chained.Require("age is positive", s => s.Age > 0);
        Teach.True(ReferenceEquals(chained, returned),
            "Require returns the SAME validator so the calls chain - a new instance each time "
                + "would throw the earlier rules away - reread README ex8.");

        Validator<int> numbers = new Validator<int>()
            .Require("must be even", n => n % 2 == 0)
            .Require("must be under 100", n => n < 100);
        Teach.Equal("must be even | must be under 100",
            string.Join(" | ", numbers.Check(101)),
            "The validator is generic in T, so the same engine grades ints - reread README ex8.");
        Teach.True(numbers.IsValid(42), "42 clears both.");

        int evaluations = 0;
        Validator<int> counting = new Validator<int>()
            .Require("first", n => { evaluations++; return false; })
            .Require("second", n => { evaluations++; return false; });
        counting.Check(1);
        Teach.Equal(2, evaluations,
            "Check runs EVERY rule and collects all the failures - stopping at the first one "
                + "would give the user one complaint at a time - reread README ex8.");
    }
}
