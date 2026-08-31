// d11_equality_semantics / ex7 - the whole contract, by hand.
// See lessons/d11_equality_semantics/README.md, "Exercise 7".

namespace CSharpDojo.D11_EqualitySemantics;

/// <summary>Sealed on purpose: it removes the inheritance question entirely.</summary>
public sealed class Money : IEquatable<Money>
{
    public Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public decimal Amount { get; }

    public string Currency { get; }

    /// <summary>
    /// The real comparison: same amount, and same currency ignoring case.
    /// null is never equal to an instance.
    /// </summary>
    public bool Equals(Money? other)
    {
        if (other is null)
        {
            return false;
        }

        return Amount == other.Amount
            && string.Equals(Currency, other.Currency, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>Delegates to the typed version after a type test.</summary>
    public override bool Equals(object? obj) => obj is Money other && Equals(other);

    /// <summary>Built from the same two values, with the same case rule.</summary>
    public override int GetHashCode() =>
        HashCode.Combine(Amount, StringComparer.OrdinalIgnoreCase.GetHashCode(Currency));

    /// <summary>
    /// Handles nulls on either side and then delegates. Test for null with
    /// `is null` - `== null` in here would call this operator again.
    /// </summary>
    public static bool operator ==(Money? left, Money? right)
    {
        if (left is null)
        {
            return right is null;
        }

        return left.Equals(right);
    }

    /// <summary>The opposite of ==.</summary>
    public static bool operator !=(Money? left, Money? right) => !(left == right);
}
