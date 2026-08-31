// d16_delegates_lambdas / ex8 - a rules engine out of predicates.
// See lessons/d16_delegates_lambdas/README.md, "Exercise 8".

namespace CSharpDojo.D16_DelegatesLambdas;

// The gate validates these. Written for you.
public record Signup(string Name, int Age);

public class Validator<T>
{
    private readonly List<(string Message, Func<T, bool> Rule)> _rules =
        new List<(string, Func<T, bool>)>();

    /// <summary>
    /// Registers a rule: when <paramref name="rule"/> answers false for an
    /// item, <paramref name="message"/> is reported. Returns this validator,
    /// so calls chain.
    /// </summary>
    public Validator<T> Require(string message, Func<T, bool> rule)
    {
        _rules.Add((message, rule));
        return this;
    }

    /// <summary>
    /// Every failed rule's message, in the order the rules were registered.
    /// An empty list means the item is fine.
    /// </summary>
    public List<string> Check(T item)
    {
        List<string> failures = new List<string>();
        foreach ((string message, Func<T, bool> rule) in _rules)
        {
            if (!rule(item))
            {
                failures.Add(message);
            }
        }

        return failures;
    }

    /// <summary>True when no rule fails.</summary>
    public bool IsValid(T item)
    {
        return Check(item).Count == 0;
    }
}
