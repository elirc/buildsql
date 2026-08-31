// d04_methods_params / ex7 - splitting money without losing a cent.
// See lessons/d04_methods_params/README.md, "Exercise 7".

namespace CSharpDojo.D04_MethodsParams;

public static class Money
{
    /// <summary>
    /// Split a non-negative total between <paramref name="ways"/> people so
    /// that every share is a whole number of cents and the shares add up to
    /// the total EXACTLY. Any leftover cents go one each to the earliest
    /// shares, so 10.00 between 3 is 3.34, 3.33, 3.33.
    ///
    /// The total is first rounded to cents with halves away from zero.
    /// A ways of 0 or less, or a negative total, throws
    /// ArgumentOutOfRangeException.
    /// </summary>
    public static decimal[] Split(decimal total, int ways)
    {
        throw new NotImplementedException("ex7: Split is not implemented yet - edit this file.");
    }
}
