// d16_delegates_lambdas / ex8 - a rules engine out of predicates.
// See lessons/d16_delegates_lambdas/README.md, "Exercise 8".

namespace CSharpDojo.D16_DelegatesLambdas;

// The gate validates these. Written for you.
public record Signup(string Name, int Age);

public class Validator<T>
{
    /// <summary>
    /// Registers a rule: when <paramref name="rule"/> answers false for an
    /// item, <paramref name="message"/> is reported. Returns this validator,
    /// so calls chain.
    /// </summary>
    public Validator<T> Require(string message, Func<T, bool> rule)
    {
        throw new NotImplementedException("ex8: Require is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Every failed rule's message, in the order the rules were registered.
    /// An empty list means the item is fine.
    /// </summary>
    public List<string> Check(T item)
    {
        throw new NotImplementedException("ex8: Check is not implemented yet - edit this file.");
    }

    /// <summary>True when no rule fails.</summary>
    public bool IsValid(T item)
    {
        throw new NotImplementedException("ex8: IsValid is not implemented yet - edit this file.");
    }
}
