// d01_routing - given code, not an exercise. Read it, do not edit it.
//
// A five-stop transit network. Eight routing drills query it; none of them
// change it. Keeping the data tiny is deliberate: every answer in the gate is
// something you can work out in your head, so a failure is always about the
// route template and never about the data.

namespace DotnetDojo.Api.D01_Routing;

public record Stop(int Id, string Code, string Name, string Zone);

public record Departure(int Id, string Line, int Hour, string Destination);

public static class Network
{
    public static readonly IReadOnlyList<Stop> Stops =
    [
        new(1, "CEN", "Central", "A"),
        new(2, "HAR", "Harbour", "B"),
        new(3, "PRK", "Parkway", "C"),
        new(4, "MKT", "Market", "A"),
        new(5, "RVR", "Riverside", "B"),
    ];

    public static readonly IReadOnlyList<Departure> Departures =
    [
        new(1, "N1", 7, "Airport"),
        new(2, "N1", 7, "Harbour"),
        new(3, "N1", 9, "Airport"),
        new(4, "S2", 7, "Parkway"),
        new(5, "S2", 18, "Central"),
        new(6, "E3", 18, "Market"),
    ];

    /// <summary>Every line the network runs, in service order. Route 1 is Lines[0].</summary>
    public static readonly IReadOnlyList<string> Lines = ["N1", "S2", "E3"];
}
