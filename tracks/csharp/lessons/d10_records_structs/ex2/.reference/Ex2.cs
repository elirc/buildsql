// d10_records_structs / ex2 - `with`, and what follows it.
// See lessons/d10_records_structs/README.md, "Exercise 2".

namespace CSharpDojo.D10_RecordsStructs;

public record Booking(string Guest, int Nights, int NightlyRate)
{
    /// <summary>Nights times the rate. Computed, never stored.</summary>
    public int Total => Nights * NightlyRate;

    /// <summary>"Ada x2".</summary>
    public string Label => $"{Guest} x{Nights}";
}

public static class Bookings
{
    /// <summary>
    /// A copy with extra nights added. A negative number of extra nights is an
    /// ArgumentOutOfRangeException.
    /// </summary>
    public static Booking Extend(Booking booking, int extraNights)
    {
        if (extraNights < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(extraNights), "Use a positive number of nights.");
        }

        return booking with { Nights = booking.Nights + extraNights };
    }

    /// <summary>A copy at a different nightly rate.</summary>
    public static Booking Reprice(Booking booking, int newRate) =>
        booking with { NightlyRate = newRate };
}
