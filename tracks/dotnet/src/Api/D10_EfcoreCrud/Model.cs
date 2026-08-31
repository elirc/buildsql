// d10_efcore_crud - given code, not an exercise. Read it, do not edit it.
//
// One entity, one DbContext, one registration. The gates replace the
// registration with a private in-memory SQLite database, one per test.

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D10_EfcoreCrud;

public class Member
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public string Email { get; set; } = "";

    public int Credits { get; set; }

    public string Grade { get; set; } = "";
}

public class D10Db(DbContextOptions<D10Db> options) : DbContext(options)
{
    public DbSet<Member> Members => Set<Member>();
}

/// <summary>What the list endpoint hands back - fewer columns than the entity.</summary>
public record MemberSummary(int Id, string Name, int Credits);

public record NewMember(string? Name, string? Email, int Credits);

public record CreditChange(int Credits);

public record Transfer(int From, int To, int Credits);

public record ChangeResult(int Changed);

public record UpsertMember(string? Name, int Credits);

public class D10Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // `dotnet run` would use this file-backed database. The gates replace
        // this registration with a private in-memory one, per test.
        services.AddDbContext<D10Db>(options => options.UseSqlite("Data Source=dojo-d10.db"));
    }
}
