// d12_generics / ex4 - everything built from one constrained member.
// See lessons/d12_generics/README.md, "Exercise 4".

namespace CSharpDojo.D12_Generics;

public class Range<T>
    where T : IComparable<T>
{
    /// <summary>A low above the high is an ArgumentException.</summary>
    public Range(T low, T high)
    {
        throw new NotImplementedException("ex4: the Range constructor is not implemented yet - edit this file.");
    }

    public T Low { get; } = default!;

    public T High { get; } = default!;

    /// <summary>Is the value inside the range? Both bounds are INCLUSIVE.</summary>
    public bool Contains(T value)
    {
        throw new NotImplementedException("ex4: Contains is not implemented yet - edit this file.");
    }

    /// <summary>Low when the value is below it, High when above, the value otherwise.</summary>
    public T Clamp(T value)
    {
        throw new NotImplementedException("ex4: Clamp is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Do the two ranges share at least one value? Ranges that merely touch at
    /// a bound DO overlap, because the bounds are inclusive.
    /// </summary>
    public bool Overlaps(Range<T> other)
    {
        throw new NotImplementedException("ex4: Overlaps is not implemented yet - edit this file.");
    }
}
