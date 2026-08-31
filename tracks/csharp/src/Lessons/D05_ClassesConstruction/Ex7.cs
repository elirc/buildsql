// d05_classes_construction / ex7 - an invariant several methods have to keep.
// See lessons/d05_classes_construction/README.md, "Exercise 7".

namespace CSharpDojo.D05_ClassesConstruction;

public class SeatMap
{
    private readonly bool[] _reserved = Array.Empty<bool>();

    /// <summary>
    /// Rows and seats-per-row must both be at least 1; anything else is
    /// ArgumentOutOfRangeException.
    /// </summary>
    public SeatMap(int rows, int seatsPerRow)
    {
        throw new NotImplementedException("ex7: the SeatMap constructor is not implemented yet - edit this file.");
    }

    public int Rows { get; }

    public int SeatsPerRow { get; }

    /// <summary>Every seat in the map.</summary>
    public int Capacity => throw new NotImplementedException("ex7: Capacity is not implemented yet - edit this file.");

    /// <summary>
    /// How many seats are still free. This must stay correct after every
    /// Reserve and Release, including the ones that change nothing.
    /// </summary>
    public int AvailableCount { get; private set; }

    /// <summary>
    /// Is that seat taken? Rows and seats are 1-based; anything outside the map
    /// is ArgumentOutOfRangeException.
    /// </summary>
    public bool IsReserved(int row, int seat)
    {
        throw new NotImplementedException("ex7: IsReserved is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Take the seat. False - and no change at all - when it was already taken.
    /// </summary>
    public bool Reserve(int row, int seat)
    {
        throw new NotImplementedException("ex7: Reserve is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Give the seat back. False - and no change at all - when it was already
    /// free.
    /// </summary>
    public bool Release(int row, int seat)
    {
        throw new NotImplementedException("ex7: Release is not implemented yet - edit this file.");
    }
}
