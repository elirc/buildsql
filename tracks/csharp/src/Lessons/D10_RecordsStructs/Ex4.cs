// d10_records_structs / ex4 - records inherit, and `with` knows it.
// See lessons/d10_records_structs/README.md, "Exercise 4".

namespace CSharpDojo.D10_RecordsStructs;

public record Vehicle(string Plate, int Wheels);

// Declare Truck as a record deriving from Vehicle. It repeats Vehicle's two
// components and adds PayloadTonnes (int), passing the first two up.
public record Truck(string Plate, int Wheels, int PayloadTonnes) : Vehicle(Plate, Wheels);

public static class Fleet
{
    /// <summary>A copy of the vehicle with a different plate.</summary>
    public static Vehicle Replate(Vehicle vehicle, string plate)
    {
        throw new NotImplementedException("ex4: Replate is not implemented yet - edit this file.");
    }

    /// <summary>
    /// The payload when the vehicle really is a truck, and 0 otherwise. Ask
    /// about the runtime type.
    /// </summary>
    public static int PayloadOf(Vehicle vehicle)
    {
        throw new NotImplementedException("ex4: PayloadOf is not implemented yet - edit this file.");
    }
}
