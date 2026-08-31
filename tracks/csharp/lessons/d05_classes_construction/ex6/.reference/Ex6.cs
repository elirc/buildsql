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
        if (latitude < -90 || latitude > 90)
        {
            throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude runs from -90 to 90.");
        }

        if (longitude < -180 || longitude > 180)
        {
            throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude runs from -180 to 180.");
        }

        Latitude = latitude;
        Longitude = longitude;
    }

    public double Latitude { get; }

    public double Longitude { get; }

    /// <summary>The two components, for `var (lat, lon) = coordinate;`.</summary>
    public void Deconstruct(out double latitude, out double longitude)
    {
        latitude = Latitude;
        longitude = Longitude;
    }

    /// <summary>
    /// The same, plus "N" when the latitude is 0 or above and "S" when it is
    /// below.
    /// </summary>
    public void Deconstruct(out double latitude, out double longitude, out string hemisphere)
    {
        Deconstruct(out latitude, out longitude);
        hemisphere = Latitude >= 0 ? "N" : "S";
    }
}
