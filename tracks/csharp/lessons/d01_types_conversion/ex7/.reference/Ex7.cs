// d01_types_conversion / ex7 - a whole ledger: parse, accumulate, round, report.
// See lessons/d01_types_conversion/README.md, "Exercise 7".

using System.Globalization;

namespace CSharpDojo.D01_TypesConversion;

public static class Ledger
{
    /// <summary>
    /// Add up a list of "op,amount" lines and return the balance rounded to two
    /// decimal places with halves away from zero.
    ///
    /// - op is "credit" (add) or "debit" (subtract), matched ignoring case and
    ///   surrounding whitespace.
    /// - amount is read with the invariant culture.
    /// - a blank or whitespace-only line is skipped, but it still counts toward
    ///   the 1-based line number used in errors.
    /// - anything else - wrong field count, unknown op, unparsable amount -
    ///   throws FormatException whose message contains "line N".
    /// </summary>
    public static decimal Balance(IEnumerable<string> lines)
    {
        decimal balance = 0m;
        int number = 0;

        foreach (string line in lines)
        {
            number++;
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            string[] parts = line.Split(',');
            if (parts.Length != 2)
            {
                throw new FormatException($"line {number}: expected 'op,amount'.");
            }

            string op = parts[0].Trim().ToLowerInvariant();
            if (!decimal.TryParse(parts[1].Trim(), NumberStyles.Number,
                    CultureInfo.InvariantCulture, out decimal amount))
            {
                throw new FormatException($"line {number}: '{parts[1].Trim()}' is not a number.");
            }

            if (op == "credit")
            {
                balance += amount;
            }
            else if (op == "debit")
            {
                balance -= amount;
            }
            else
            {
                throw new FormatException($"line {number}: unknown operation '{op}'.");
            }
        }

        return Math.Round(balance, 2, MidpointRounding.AwayFromZero);
    }
}
