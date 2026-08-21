// 07_generics / challenge - generic maths: one algorithm for every number type.
// See lessons/07_generics/README.md, "Challenge".

using System.Numerics;

namespace CSharpDojo.L07_Generics;

public static class Statistics
{
    /// <summary>
    /// The sum, for any numeric type: int, double, decimal, long...
    /// The INumber&lt;T&gt; constraint is what gives you T.Zero and operator +.
    /// </summary>
    public static T Total<T>(IEnumerable<T> values) where T : INumber<T>
    {
        throw new NotImplementedException("challenge: Total is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The mean. An empty sequence has no mean: throw InvalidOperationException.
    /// Integer types divide as integers, which is the caller's problem, not yours.
    /// </summary>
    public static T Average<T>(IEnumerable<T> values) where T : INumber<T>
    {
        throw new NotImplementedException("challenge: Average is not implemented yet - edit this file.");
    }
}
