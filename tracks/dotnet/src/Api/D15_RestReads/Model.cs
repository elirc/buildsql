// d15_rest_reads - given code, not an exercise. Read it, do not edit it.
//
// A bike-share network: five docking stations and twelve bikes. The data is
// static and read-only - every exercise in this set is a GET, and the drill is
// HTTP semantics rather than storage. A bike that is out on a ride has no
// station code; a bike that is docked has one, whatever its status.

namespace DotnetDojo.Api.D15_RestReads;

public sealed record Station(string Code, string Name, string Zone, int Capacity);

/// <summary>Status is "available", "in_use" or "service". StationCode is null while out on a ride.</summary>
public sealed record Bike(int Id, string Model, string Status, string? StationCode);

public static class D15Network
{
    // Deliberately NOT in code order - ex1 has to sort.
    public static readonly IReadOnlyList<Station> Stations =
    [
        new("hs11", "Harbour Steps", "central", 16),
        new("cw07", "Canal Works", "north", 12),
        new("vg02", "Vale Gardens", "south", 8),
        new("cw01", "Cathedral Wharf", "central", 20),
        new("ep03", "Elm Park", "north", 30),
    ];

    public static readonly IReadOnlyList<Bike> Bikes =
    [
        new(1, "roadster", "available", "cw01"),
        new(2, "roadster", "available", "cw01"),
        new(3, "cargo", "service", "cw01"),
        new(4, "roadster", "in_use", null),
        new(5, "cruiser", "available", "ep03"),
        new(6, "cargo", "available", "ep03"),
        new(7, "cruiser", "in_use", null),
        new(8, "roadster", "in_use", null),
        new(9, "cruiser", "available", "vg02"),
        new(10, "cargo", "available", "cw07"),
        new(11, "roadster", "available", "cw07"),
        new(12, "roadster", "available", "cw07"),
    ];

    /// <summary>Every status a client may ask for. Anything else is a 400.</summary>
    public static readonly IReadOnlyList<string> Statuses =
        ["available", "in_use", "service", "retired"];

    /// <summary>Every model a client may ask for. Anything else is a 400.</summary>
    public static readonly IReadOnlyList<string> Models = ["cargo", "cruiser", "roadster"];

    public static Station? Find(string? code) =>
        Stations.FirstOrDefault(s => s.Code == code);

    public static int AvailableAt(string code) =>
        Bikes.Count(b => b.StationCode == code && b.Status == "available");
}

public record StationCard(string Code, string Name, string Zone, int Capacity, int Available);

public record BikeCard(int Id, string Model, string Status, string? StationCode);

public record NetworkSummary(int Stations, int Bikes, int Available);

public record StationReport(
    string Code,
    string Name,
    int Capacity,
    int Docked,
    int Available,
    int Free,
    List<string> Models);
