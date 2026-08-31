// d18_problemdetails - given code, not an exercise. Read it, do not edit it.
//
// A small ferry operator. Every exercise in this set is about the SHAPE of a
// failure: RFC 9457 problem details, with a stable "type" URI a client can
// switch on, a human "title", the "status" repeated in the body, a "detail"
// about this one occurrence, an "instance" saying which request it was, and
// extension members carrying the machine-readable specifics.
//
// The gates read those members by name and check the content type is
// application/problem+json, which a bare TypedResults.NotFound() is not.

namespace DotnetDojo.Api.D18_ProblemDetails;

public sealed record Sailing(string Code, string Route, int Seats, int Sold)
{
    public int Left => Seats - Sold;
}

public static class D18Ferry
{
    /// <summary>Every problem type this API can produce hangs off this prefix.</summary>
    public const string ProblemBase = "https://dojo.test/problems/";

    public static readonly IReadOnlyList<Sailing> Sailings =
    [
        new("ard-11", "Ardgour to Corran", 60, 12),
        new("mor-07", "Morvich to Kyle", 40, 40),
        new("uig-03", "Uig to Tarbert", 25, 24),
    ];

    public const int MaxSeatsPerBooking = 6;

    public static Sailing? Find(string? code) => Sailings.FirstOrDefault(s => s.Code == code);
}

/// <summary>Given: the domain errors ex4 and ex5 have to translate into statuses.</summary>
public class SailingNotFoundException(string code)
    : Exception($"No sailing {code}.")
{
    public string Code { get; } = code;
}

public class SailingFullException(string code, int left)
    : Exception($"Sailing {code} has {left} seats left.")
{
    public string Code { get; } = code;

    public int Left { get; } = left;
}

public class PaymentDeclinedException(string reason)
    : Exception("The card was declined.")
{
    public string Reason { get; } = reason;
}

public static class D18Booking
{
    /// <summary>
    /// Given: the domain call ex4, ex5 and ex8 sit in front of. It throws
    /// rather than returning a result, which is the whole problem those
    /// exercises exist to solve.
    /// </summary>
    public static Sailing Reserve(string code, int seats, string? card)
    {
        if (code == "boom")
        {
            throw new InvalidOperationException("connection string: Server=prod-01;Password=hunter2");
        }

        var sailing = D18Ferry.Find(code) ?? throw new SailingNotFoundException(code);

        if (sailing.Left < seats)
        {
            throw new SailingFullException(code, sailing.Left);
        }

        if (card == "0000")
        {
            throw new PaymentDeclinedException("insufficient_funds");
        }

        return sailing;
    }

    /// <summary>Given: a call that always fails in a way nobody planned for.</summary>
    public static Sailing Manifest(string code)
    {
        if (code == "boom")
        {
            throw new InvalidOperationException("connection string: Server=prod-01;Password=hunter2");
        }

        return D18Ferry.Find(code) ?? throw new SailingNotFoundException(code);
    }
}

public record SailingDto(string Code, string Route, int Seats, int Left);

public record SeatRequest(int Seats);

public record PurchaseRequest(int Seats, string? Card);

public record OrderRequest(string? SailingCode, int Seats, string? Card);

public record OrderAccepted(string Reference, string SailingCode, int Seats);
