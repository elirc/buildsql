// d11_equality_semantics / ex6 - a comparer for someone else's type.
// See lessons/d11_equality_semantics/README.md, "Exercise 6".

namespace CSharpDojo.D11_EqualitySemantics;

/// <summary>Not ours to change - so a different notion of "same" lives outside it.</summary>
public class Reading
{
    public Reading(double latitude, double longitude)
    {
        Latitude = latitude;
        Longitude = longitude;
    }

    public double Latitude { get; }

    public double Longitude { get; }
}

/// <summary>
/// Two readings are the same when both coordinates FLOOR to the same whole
/// number - that is, when they fall in the same one-degree grid square.
/// </summary>
public class GridCellComparer : IEqualityComparer<Reading>
{
    /// <summary>Two nulls are equal; one null is not; otherwise compare cells.</summary>
    public bool Equals(Reading? x, Reading? y)
    {
        if (x is null || y is null)
        {
            return x is null && y is null;
        }

        return Cell(x) == Cell(y);
    }

    /// <summary>A hash of the cell, so equal readings hash the same.</summary>
    public int GetHashCode(Reading obj)
    {
        (int latitude, int longitude) = Cell(obj);
        return HashCode.Combine(latitude, longitude);
    }

    private static (int Latitude, int Longitude) Cell(Reading reading) =>
        ((int)Math.Floor(reading.Latitude), (int)Math.Floor(reading.Longitude));
}

public static class Readings
{
    /// <summary>How many distinct grid cells the readings fall in.</summary>
    public static int DistinctCells(IEnumerable<Reading> readings) =>
        readings.Distinct(new GridCellComparer()).Count();
}
