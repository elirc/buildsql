// d12_generics / ex4 - everything built from one constrained member.
// See lessons/d12_generics/README.md, "Exercise 4".

namespace CSharpDojo.D12_Generics;

public class Range<T>
    where T : IComparable<T>
{
    /// <summary>A low above the high is an ArgumentException.</summary>
    public Range(T low, T high)
    {
        if (low.CompareTo(high) > 0)
        {
            throw new ArgumentException("The low bound is above the high bound.", nameof(low));
        }

        Low = low;
        High = high;
    }

    public T Low { get; } = default!;

    public T High { get; } = default!;

    /// <summary>Is the value inside the range? Both bounds are INCLUSIVE.</summary>
    public bool Contains(T value) => Low.CompareTo(value) <= 0 && High.CompareTo(value) >= 0;

    /// <summary>Low when the value is below it, High when above, the value otherwise.</summary>
    public T Clamp(T value)
    {
        if (value.CompareTo(Low) < 0)
        {
            return Low;
        }

        return value.CompareTo(High) > 0 ? High : value;
    }

    /// <summary>
    /// Do the two ranges share at least one value? Ranges that merely touch at
    /// a bound DO overlap, because the bounds are inclusive.
    /// </summary>
    public bool Overlaps(Range<T> other) =>
        Low.CompareTo(other.High) <= 0 && other.Low.CompareTo(High) <= 0;
}
