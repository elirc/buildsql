// 06_structs_records / ex1 - a readonly struct with value semantics.
// See lessons/06_structs_records/README.md, "Exercise 1".

using System.Globalization;

namespace CSharpDojo.L06_StructsRecords;

/// <summary>
/// Small, immutable, and compared by its contents: the shape a struct is for.
/// </summary>
public readonly struct Money
{
    public Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public decimal Amount { get; }

    public string Currency { get; }

    /// <summary>
    /// A NEW Money holding the sum. Adding two different currencies is
    /// nonsense: throw InvalidOperationException.
    /// </summary>
    public Money Add(Money other)
    {
        if (other.Currency != Currency)
        {
            throw new InvalidOperationException($"Cannot add {other.Currency} to {Currency}.");
        }

        return new Money(Amount + other.Amount, Currency);
    }

    /// <summary>"GBP 5.00" - currency, a space, then two decimal places.</summary>
    public override string ToString()
    {
        return $"{Currency} {Amount.ToString("0.00", CultureInfo.InvariantCulture)}";
    }
}
