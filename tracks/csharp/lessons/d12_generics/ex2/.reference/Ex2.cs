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
    public Pair<TSecond, TFirst> Swapped() => new Pair<TSecond, TFirst>(Second, First);

    /// <summary>"(1, a)" - both components, in brackets, separated by ", ".</summary>
    public override string ToString() => $"({First}, {Second})";
}
