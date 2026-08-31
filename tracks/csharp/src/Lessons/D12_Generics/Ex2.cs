// d12_generics / ex2 - a generic type with two parameters.
// See lessons/d12_generics/README.md, "Exercise 2".

namespace CSharpDojo.D12_Generics;

public class Pair<TFirst, TSecond>
{
    public Pair(TFirst first, TSecond second)
    {
        First = first;
        Second = second;
    }

    public TFirst First { get; }

    public TSecond Second { get; }

    /// <summary>The same two values the other way round - note the return type.</summary>
    public Pair<TSecond, TFirst> Swapped()
    {
        throw new NotImplementedException("ex2: Swapped is not implemented yet - edit this file.");
    }

    /// <summary>"(1, a)" - both components, in brackets, separated by ", ".</summary>
    public override string ToString()
    {
        throw new NotImplementedException("ex2: ToString is not implemented yet - edit this file.");
    }
}
