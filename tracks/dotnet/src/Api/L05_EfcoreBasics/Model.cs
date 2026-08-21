// 05_efcore_basics - given code, not an exercise. Read it, do not edit it.
//
// One entity, one DbContext, one registration. Every exercise in this lesson
// queries or changes this model; none of them change these three declarations.

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L05_EfcoreBasics;

/// <summary>A row in the Products table. Plain properties - EF needs nothing else.</summary>
public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public int PriceCents { get; set; }

    public string Category { get; set; } = "";
}

/// <summary>The unit of work: one DbSet per table, one instance per request.</summary>
public class CatalogDb(DbContextOptions<CatalogDb> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
}

/// <summary>What the list endpoints hand back - fewer columns than the entity.</summary>
public record ProductSummary(int Id, string Name, int PriceCents);

public record NewProduct(string? Name, int PriceCents, string? Category);

public record RenameResult(int Changes, string Name);

public record ProductPage(List<ProductSummary> Items, int Total, int Page, int Size);

public class CatalogServices : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // `dotnet run` would use this file-backed database. The gates replace
        // this registration with a private in-memory one, per test.
        services.AddDbContext<CatalogDb>(options => options.UseSqlite("Data Source=dojo-l05.db"));
    }
}
