using System.Reflection;

using CSharpDojo.L07_Generics;

namespace CSharpDojo.Gates;

public class L07_GenericsTests
{
    [Fact]
    public void Ex1_OneMethodServesEveryElementType()
    {
        Teach.Equal(10, Utils.FirstOr(new[] { 10, 20 }, -1),
            "The first item of a non-empty sequence - reread README ex1.");
        Teach.Equal(-1, Utils.FirstOr(Array.Empty<int>(), -1),
            "Nothing to take, so the fallback comes back. Note you cannot write `return null` "
                + "here: T might be an int - reread README ex1.");
        Teach.Equal("none", Utils.FirstOr(new List<string>(), "none"),
            "The same method, a different T, no cast anywhere.");

        string first = "left";
        string second = "right";
        Utils.Swap(ref first, ref second);

        Teach.Equal("right", first,
            "Swap must exchange the CALLER's variables, which is what ref means - reread "
                + "README ex1.");
        Teach.Equal("left", second, "And the other way for the second one.");

        Teach.Equal(3, Utils.CountOf(new[] { 1, 2, 3 }), "Three items.");
        Teach.Equal(0, Utils.CountOf(Array.Empty<string>()), "No items.");
    }

    [Fact]
    public void Ex2_ConstraintsUnlockWhatYouCanDoWithT()
    {
        Teach.Equal(9, Constrained.Max(new[] { 3, 9, 2 }),
            "IComparable<T> is what makes item.CompareTo(best) legal - without the constraint "
                + "the compiler will not let you compare two Ts at all - reread README ex2.");

        Teach.Equal("pear", Constrained.Max(new[] { "apple", "pear", "fig" }),
            "string implements IComparable<string>, so the same method sorts words - and "
                + "\"pear\" is last alphabetically here.");

        Teach.Equal(-2, Constrained.Max(new[] { -9, -2, -5 }),
            "Seeding your running maximum with 0 or default(T) instead of the first item is "
                + "the classic bug: every value here is negative.");

        Teach.Throws<InvalidOperationException>(() => Constrained.Max(Array.Empty<int>()),
            "There is no largest item in an empty sequence, and default(T) would be a lie - "
                + "throw InvalidOperationException, which is what LINQ's own Max does.");

        List<Widget> made = Constrained.Fill<Widget>(3);
        Teach.Equal(3, made.Count, "Fill produces exactly count items - reread README ex2.");
        Teach.True(made[0] is not null && !ReferenceEquals(made[0], made[1]),
            "Each item must be a SEPARATE new T(). Adding the same instance three times is a "
                + "different thing entirely.");
    }

    public sealed class Widget
    {
        public int Value { get; set; }
    }

    [Fact]
    public void Ex3_ResultCarriesEitherAValueOrAReason()
    {
        Result<int> ok = Result<int>.Ok(42);

        Teach.True(ok.IsOk, "Ok produces a successful result - reread README ex3.");
        Teach.Equal(42, ok.Value, "...carrying the value it was given.");
        Teach.Equal("", ok.Error, "A successful result has nothing to explain, so Error is \"\".");

        Result<int> failed = Result<int>.Fail("not found");

        Teach.True(!failed.IsOk, "Fail produces a failed result.");
        Teach.Equal("not found", failed.Error, "...carrying the reason.");
        Teach.Throws<InvalidOperationException>(() => _ = failed.Value,
            "Asking a failed Result for its value must throw rather than hand back a silent "
                + "default(T) - a zero that means \"no answer\" is how bad data spreads - "
                + "reread README ex3.");

        Result<string> text = Result<string>.Ok("hello");
        Teach.Equal("hello", text.Value,
            "The same generic type at a different T, with no casting and no boxing.");
    }

    [Fact]
    public void Ex4_VarianceDecidesWhichConversionsAreLegal()
    {
        Type producerParameter = typeof(IProducer<>).GetGenericArguments()[0];
        Teach.True(producerParameter.GenericParameterAttributes.HasFlag(GenericParameterAttributes.Covariant),
            "IProducer only ever hands a T out, so its parameter should be COVARIANT: declare "
                + "it `out T` - reread README ex4.");

        Type consumerParameter = typeof(IConsumer<>).GetGenericArguments()[0];
        Teach.True(consumerParameter.GenericParameterAttributes.HasFlag(GenericParameterAttributes.Contravariant),
            "IConsumer only ever takes a T in, so its parameter should be CONTRAVARIANT: "
                + "declare it `in T` - reread README ex4.");

        object produced = Variance.Widen(new GreetingProducer()).Produce();
        Teach.Equal("hello", produced,
            "Widen just returns its argument: with `out T`, an IProducer<string> already IS an "
                + "IProducer<object> and no conversion code is needed - reread README ex4.");

        Teach.Equal("consumed abc", Variance.Narrow(new AnythingConsumer()).Consume("abc"),
            "And with `in T`, a consumer of objects already IS a consumer of strings.");
    }

    [Fact]
    public void Challenge_OneSumForEveryNumericType()
    {
        Teach.Equal(6, Statistics.Total(new[] { 1, 2, 3 }),
            "T.Zero is the generic way to say \"the additive identity of whatever T is\" - "
                + "reread README challenge.");
        Teach.Equal(4.0, Statistics.Total(new[] { 1.5, 2.5 }),
            "The same method over doubles.");
        Teach.Equal(3.3m, Statistics.Total(new[] { 1.1m, 2.2m }),
            "...and over decimals, where 1.1 + 2.2 is exactly 3.3.");
        Teach.Equal(0, Statistics.Total(Array.Empty<int>()),
            "The sum of nothing is zero, and T.Zero already said so.");

        Teach.Equal(4, Statistics.Average(new[] { 2, 4, 6 }),
            "12 over 3. Turning the int count into a T is the interesting line: "
                + "T.CreateChecked(count) - reread README challenge.");
        Teach.Equal(2.5, Statistics.Average(new[] { 2.0, 3.0 }),
            "Over doubles the same code gives a fractional answer.");
        Teach.Throws<InvalidOperationException>(() => Statistics.Average(Array.Empty<double>()),
            "Dividing by zero items is undefined - throw rather than returning NaN.");
    }

    [Fact]
    public void Review1_ConstrainedGenericsOverTwoDifferentTs()
    {
        Teach.Equal(7, Thresholds.FirstAbove(new[] { 2, 5, 7, 9 }, 5, -1),
            "Strictly greater: 5 itself does not qualify - reread README review.");
        Teach.Equal(-1, Thresholds.FirstAbove(new[] { 1, 2 }, 99, -1),
            "Nothing qualifies, so the fallback comes back.");
        Teach.Equal("cat", Thresholds.FirstAbove(new[] { "ant", "cat", "dog" }, "b", "none"),
            "The same method over strings, comparing alphabetically.");

        Teach.Equal(3, Thresholds.CountBetween(new[] { 1, 5, 7, 9, 12 }, 5, 9),
            "Inclusive at both ends: 5, 7 and 9 all count - reread README review.");
        Teach.Equal(0, Thresholds.CountBetween(Array.Empty<int>(), 0, 10),
            "Nothing in an empty sequence falls anywhere.");
    }
}
