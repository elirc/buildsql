// d01_types_conversion / ex7 - a whole ledger: parse, accumulate, round, report.
// See lessons/d01_types_conversion/README.md, "Exercise 7".

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
        throw new NotImplementedException("ex7: Balance is not implemented yet - edit this file.");
    }
}
