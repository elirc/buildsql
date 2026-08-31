// d10_records_structs / ex2 - `with`, and what follows it.
// See lessons/d10_records_structs/README.md, "Exercise 2".

namespace CSharpDojo.D10_RecordsStructs;

public record Booking(string Guest, int Nights, int NightlyRate)
{
    /// <summary>Nights times the rate. Computed, never stored.</summary>
    public int Total => throw new NotImplementedException("ex2: Total is not implemented yet - edit this file.");

    /// <summary>"Ada x2".</summary>
    public string Label => throw new NotImplementedException("ex2: Label is not implemented yet - edit this file.");
}

public static class Bookings
{
    /// <summary>
    /// A copy with extra nights added. A negative number of extra nights is an
    /// ArgumentOutOfRangeException.
    /// </summary>
    public static Booking Extend(Booking booking, int extraNights)
    {
        throw new NotImplementedException("ex2: Extend is not implemented yet - edit this file.");
    }

    /// <summary>A copy at a different nightly rate.</summary>
    public static Booking Reprice(Booking booking, int newRate)
    {
        throw new NotImplementedException("ex2: Reprice is not implemented yet - edit this file.");
    }
}
