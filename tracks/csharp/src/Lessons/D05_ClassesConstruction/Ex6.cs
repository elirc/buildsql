// d05_classes_construction / ex6 - taking an object apart again.
// See lessons/d05_classes_construction/README.md, "Exercise 6".

namespace CSharpDojo.D05_ClassesConstruction;

public class Coordinate
{
    /// <summary>
    /// Latitude must be between -90 and 90 and longitude between -180 and 180,
    /// both inclusive; anything else is ArgumentOutOfRangeException.
    /// </summary>
    public Coordinate(double latitude, double longitude)
    {
        throw new NotImplementedException("ex6: the Coordinate constructor is not implemented yet - edit this file.");
    }

    public double Latitude { get; }

    public double Longitude { get; }

    /// <summary>The two components, for `var (lat, lon) = coordinate;`.</summary>
    public void Deconstruct(out double latitude, out double longitude)
    {
        throw new NotImplementedException("ex6: the two-part Deconstruct is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The same, plus "N" when the latitude is 0 or above and "S" when it is
    /// below.
    /// </summary>
    public void Deconstruct(out double latitude, out double longitude, out string hemisphere)
    {
        throw new NotImplementedException("ex6: the three-part Deconstruct is not implemented yet - edit this file.");
    }
}
