// d19_logging - given code, not an exercise. Read it, do not edit it.
//
// A warehouse pick-and-pack line. Every exercise in this set is graded on what
// the application LOGGED as much as on what it returned: the gates boot the app
// with a capturing logger and read back each entry's level, its category, its
// exception, and its named properties.
//
// A named property only exists if you used a message TEMPLATE:
//
//     logger.LogInformation("Pick {PickId} started", id);   // PickId = 41
//     logger.LogInformation($"Pick {id} started");          // no properties
//
// The second one renders identically and is worthless to every log query you
// will ever write.

namespace DotnetDojo.Api.D19_Logging;

public sealed record PickLine(string Sku, string Description, int Wanted, int OnHand);

public sealed record Pick(int Id, string OrderRef, IReadOnlyList<PickLine> Lines);

public sealed record Courier(string Code, string Name);

public static class D19Warehouse
{
    public static readonly IReadOnlyList<Pick> Picks =
    [
        new(41, "SO-1001",
        [
            new("A-100", "Kettle", 2, 9),
            new("B-200", "Toaster", 1, 0),
        ]),
        new(42, "SO-1002",
        [
            new("C-300", "Blender", 3, 5),
        ]),
        new(43, "SO-1003",
        [
            new("D-400", "Grinder", 1, 4),
        ]),
    ];

    public static readonly IReadOnlyList<Courier> Couriers =
    [
        new("fw", "Fleetwing"),
        new("nr", "Northroad"),
    ];

    public const int MaxParcelKg = 30;

    public static Pick? Find(int id) => Picks.FirstOrDefault(p => p.Id == id);

    public static Pick? ByOrder(string? orderRef) => Picks.FirstOrDefault(p => p.OrderRef == orderRef);

    public static Courier? Courier(string? code) => Couriers.FirstOrDefault(c => c.Code == code);
}

/// <summary>Given: the label printer. It always fails, and it says too much when it does.</summary>
public static class D19Labels
{
    public static string Render(int pickId) =>
        throw new InvalidOperationException(
            $"printer spool token=SPOOL-9f2c1 rejected the job for pick {pickId}");
}

/// <summary>Given: the carrier booking. Thirteen kilos is cursed.</summary>
public static class D19Dispatch
{
    public static string Book(string orderRef, int weightKg)
    {
        if (weightKg == 13)
        {
            throw new InvalidOperationException("carrier api key=KEY-77aa timed out");
        }

        return $"{orderRef}-{weightKg}";
    }
}

/// <summary>Given: the carton packer. Two items per carton, rounded up - and pick 43 jams it.</summary>
public static class D19Packing
{
    public static int Pack(Pick pick)
    {
        if (pick.Id == 43)
        {
            throw new InvalidOperationException("carton feeder token=FEED-31be jammed");
        }

        return (pick.Lines.Sum(l => l.Wanted) + 1) / 2;
    }
}

public record StartedPick(int PickId, string OrderRef);

public record ScanRequest(string? Sku);

public record ScanResult(string Sku, int OnHand);

public record PickDto(int Id, string OrderRef, int Lines);

public record DispatchRequest(string? OrderRef, string? CourierCode, string? CourierToken);

public record DispatchResult(string OrderRef, string Courier);

public record CompletedPick(int PickId, int Items);

public record ShipmentRequest(string? OrderRef, int WeightKg);

public record ShipmentAccepted(string Reference, string OrderRef, int WeightKg);

public record PackedPick(int PickId, int Cartons);
