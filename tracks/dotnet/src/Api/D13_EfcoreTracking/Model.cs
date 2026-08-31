// d13_efcore_tracking - given code, not an exercise. Read it, do not edit it.
//
// A delivery fleet: vans, their inspection notes, and an audit table the board
// endpoint writes into. The gates replace the registration below with a
// private in-memory SQLite database, one per test, and count every SQL
// command EF Core sends - several exercises in this set are graded on that
// count as much as on the response body.

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D13_EfcoreTracking;

public class Van
{
    public int Id { get; set; }

    public string Plate { get; set; } = "";

    public string Depot { get; set; } = "";

    public int Mileage { get; set; }

    /// <summary>"ready", "repair" or "retired" - always lowercase in the database.</summary>
    public string Status { get; set; } = "";
}

public class InspectionLog
{
    public int Id { get; set; }

    public int VanId { get; set; }

    public string Note { get; set; } = "";
}

/// <summary>One row per time somebody looked at the board (ex1 writes these).</summary>
public class BoardView
{
    public int Id { get; set; }

    public string Note { get; set; } = "";
}

public class D13Db(DbContextOptions<D13Db> options) : DbContext(options)
{
    public DbSet<Van> Vans => Set<Van>();

    public DbSet<InspectionLog> Inspections => Set<InspectionLog>();

    public DbSet<BoardView> BoardViews => Set<BoardView>();
}

public record BoardRow(int Id, string Plate, string Status);

public record MileageChange(int Mileage);

public record DepotChange(string? Depot);

public record ChangeReport(bool Changed);

public record RecheckReport(string Plate, bool SameInstance);

public record VanReplacement(string? Plate, string? Depot, int Mileage, string? Status);

public record BumpRequest(int Amount);

public record DepotVan(int Id, int Mileage);

public record TuneupReport(int Id, int Mileage);

public record SyncItem(int Id, int Mileage);

public record SyncError(int Index, string Message);

public record SyncResult(int Updated);

/// <summary>
/// Given code for ex7: the calibration job. It writes straight past the change
/// tracker with ExecuteUpdate, exactly like a second process would.
/// </summary>
public static class D13Calibration
{
    public const int DriftKm = 25;

    public static Task<int> Apply(D13Db db, int vanId) =>
        db.Vans
            .Where(v => v.Id == vanId)
            .ExecuteUpdateAsync(s => s.SetProperty(v => v.Mileage, v => v.Mileage + DriftKm));
}

public class D13Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // `dotnet run` would use this file-backed database. The gates replace
        // this registration with a private in-memory one, per test.
        services.AddDbContext<D13Db>(options => options.UseSqlite("Data Source=dojo-d13.db"));
    }
}
