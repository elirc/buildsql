// d20_linq_joins_flatten / ex6 - joining on more than one column.
// See lessons/d20_linq_joins_flatten/README.md, "Exercise 6".

namespace CSharpDojo.D20_LinqJoinsFlatten;

// The gate builds these. Written for you.
public record Shift(string Day, string Room, string Nurse);

public record Booking(string Day, string Room, string Patient);

public static class Rota
{
    /// <summary>
    /// "Mon/A smith-&gt;ada" for every booking that has a shift on the same day
    /// AND in the same room, ordered by day, then room, then patient,
    /// then nurse, all ordinal ascending. Two shifts covering one booking
    /// produce two rows.
    /// </summary>
    public static List<string> Covered(IEnumerable<Shift> shifts, IEnumerable<Booking> bookings)
    {
        throw new NotImplementedException("ex6: Covered is not implemented yet - edit this file.");
    }

    /// <summary>
    /// "Tue/B/jones" for every booking with no shift covering it, ordered by
    /// day, then room, then patient, all ordinal ascending.
    /// </summary>
    public static List<string> Uncovered(IEnumerable<Shift> shifts, IEnumerable<Booking> bookings)
    {
        throw new NotImplementedException("ex6: Uncovered is not implemented yet - edit this file.");
    }
}
