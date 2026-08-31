// d08_polymorphism / ex3 - a pipeline of interchangeable steps.
// See lessons/d08_polymorphism/README.md, "Exercise 3".

namespace CSharpDojo.D08_Polymorphism;

public abstract class Adjustment
{
    /// <summary>Take an amount, hand back the adjusted amount.</summary>
    public abstract decimal Apply(decimal amount);
}

public class PercentOff : Adjustment
{
    public PercentOff(decimal percent)
    {
        Percent = percent;
    }

    public decimal Percent { get; }

    /// <summary>The amount less that percentage, rounded to 2 dp away from zero.</summary>
    public override decimal Apply(decimal amount)
    {
        throw new NotImplementedException("ex3: PercentOff.Apply is not implemented yet - edit this file.");
    }
}

public class AmountOff : Adjustment
{
    public AmountOff(decimal amount)
    {
        Amount = amount;
    }

    public decimal Amount { get; }

    /// <summary>The amount less a fixed sum, never going below zero.</summary>
    public override decimal Apply(decimal amount)
    {
        throw new NotImplementedException("ex3: AmountOff.Apply is not implemented yet - edit this file.");
    }
}

public class RoundDownToWhole : Adjustment
{
    /// <summary>The amount with any fraction dropped: 9.99 becomes 9.</summary>
    public override decimal Apply(decimal amount)
    {
        throw new NotImplementedException("ex3: RoundDownToWhole.Apply is not implemented yet - edit this file.");
    }
}

public static class Pipeline
{
    /// <summary>
    /// Feed the amount through every adjustment IN ORDER, each one seeing what
    /// the previous one produced. No adjustments means the amount unchanged.
    /// </summary>
    public static decimal Run(IEnumerable<Adjustment> adjustments, decimal amount)
    {
        throw new NotImplementedException("ex3: Run is not implemented yet - edit this file.");
    }
}
