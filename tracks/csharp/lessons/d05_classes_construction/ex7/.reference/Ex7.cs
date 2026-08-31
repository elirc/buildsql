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
        if (rows < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(rows), "A seat map has at least one row.");
        }

        if (seatsPerRow < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(seatsPerRow), "A row has at least one seat.");
        }

        Rows = rows;
        SeatsPerRow = seatsPerRow;
        _reserved = new bool[rows * seatsPerRow];
        AvailableCount = _reserved.Length;
    }

    public int Rows { get; }

    public int SeatsPerRow { get; }

    /// <summary>Every seat in the map.</summary>
    public int Capacity => Rows * SeatsPerRow;

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
        return _reserved[IndexOf(row, seat)];
    }

    /// <summary>
    /// Take the seat. False - and no change at all - when it was already taken.
    /// </summary>
    public bool Reserve(int row, int seat)
    {
        int index = IndexOf(row, seat);
        if (_reserved[index])
        {
            return false;
        }

        _reserved[index] = true;
        AvailableCount--;
        return true;
    }

    /// <summary>
    /// Give the seat back. False - and no change at all - when it was already
    /// free.
    /// </summary>
    public bool Release(int row, int seat)
    {
        int index = IndexOf(row, seat);
        if (!_reserved[index])
        {
            return false;
        }

        _reserved[index] = false;
        AvailableCount++;
        return true;
    }

    private int IndexOf(int row, int seat)
    {
        if (row < 1 || row > Rows)
        {
            throw new ArgumentOutOfRangeException(nameof(row), $"Rows run from 1 to {Rows}.");
        }

        if (seat < 1 || seat > SeatsPerRow)
        {
            throw new ArgumentOutOfRangeException(nameof(seat), $"Seats run from 1 to {SeatsPerRow}.");
        }

        return (row - 1) * SeatsPerRow + (seat - 1);
    }
}
