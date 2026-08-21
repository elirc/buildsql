// 05_interfaces / ex4 - depend on interfaces, receive them from outside.
// See lessons/05_interfaces/README.md, "Exercise 4".

namespace CSharpDojo.L05_Interfaces;

/// <summary>Where "now" comes from. Not DateTime.Now, so a test can decide.</summary>
public interface IClock
{
    DateTime Now { get; }
}

/// <summary>One way of turning a gross amount into a payable one.</summary>
public interface IDiscountPolicy
{
    decimal Apply(decimal amount);
}

public class Checkout
{
    private readonly IClock _clock;
    private readonly IDiscountPolicy _policy;

    /// <summary>
    /// The two collaborators arrive from outside; Checkout never creates them.
    /// Store them in the two fields above.
    /// </summary>
    public Checkout(IClock clock, IDiscountPolicy policy)
    {
        _clock = clock;
        _policy = policy;
    }

    /// <summary>"2026-08-20: 90" - the date, then the discounted amount.</summary>
    public string Receipt(decimal amount)
    {
        return $"{_clock.Now:yyyy-MM-dd}: {_policy.Apply(amount)}";
    }
}
