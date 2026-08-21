// 07_rest_crud - given code, not an exercise. Read it, do not edit it.
//
// Note the two kinds of type in this file. `Widget` is an ENTITY: it maps to a
// table and it has fields that exist for the database's benefit and nobody
// else's. `WidgetDto`, `CreateWidget` and `UpdateWidget` are DTOs: they are the
// contract with the outside world, and they contain exactly what a client is
// allowed to see or to set.

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L07_RestCrud;

public class Widget
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public string Sku { get; set; } = "";

    public int PriceCents { get; set; }

    /// <summary>Internal. Must never reach a client.</summary>
    public string InternalNotes { get; set; } = "";

    /// <summary>Internal. Must never be settable by a client.</summary>
    public int Revision { get; set; }
}

public class WidgetDb(DbContextOptions<WidgetDb> options) : DbContext(options)
{
    public DbSet<Widget> Widgets => Set<Widget>();
}

/// <summary>What a client is allowed to see.</summary>
public record WidgetDto(int Id, string Name, string Sku, int PriceCents);

/// <summary>What a client is allowed to send when creating.</summary>
public record CreateWidget(string? Name, string? Sku, int PriceCents);

/// <summary>What a client is allowed to send when replacing.</summary>
public record UpdateWidget(string? Name, string? Sku, int PriceCents);

public class WidgetServices : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // The gates replace this with a private in-memory database, per test.
        services.AddDbContext<WidgetDb>(options => options.UseSqlite("Data Source=dojo-l07.db"));
    }
}
