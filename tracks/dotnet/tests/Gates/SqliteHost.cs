// Harness, not content. Boots src/Api with one DbContext repointed at a
// private, in-memory SQLite database.
//
// Two properties make this safe to grade against:
//
//   * Isolation. Every SqliteHost opens its own connection to "DataSource=:memory:",
//     which SQLite treats as a brand new database belonging to that connection
//     alone. One test's INSERT cannot be seen by another test, so exercises
//     that create and delete rows can be graded in any order.
//   * The connection is held open for the life of the host, because an
//     in-memory SQLite database is destroyed the moment its last connection
//     closes - including the connection EF opens and closes around a query.
//
// The learner's own registration (a file-backed database, so `dotnet run`
// works) is removed and replaced here, which also means a lesson's gates do
// not depend on the learner having got the connection string right.
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;

namespace DotnetDojo.Gates;

public sealed class SqliteHost<TContext> : WebApplicationFactory<Program>
    where TContext : DbContext
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    /// <summary>Counts the SQL commands EF Core executes - the N+1 detector.</summary>
    public CommandCounter Commands { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection.Open();

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<TContext>>();
            services.RemoveAll<DbContextOptions>();
            services.RemoveAll<TContext>();
            services.AddDbContext<TContext>(options => options.UseSqlite(_connection));
        });

        builder.ConfigureLogging(logging => logging.AddProvider(Commands));
    }

    /// <summary>Creates the schema and fills it. Call once, before the first request.</summary>
    public SqliteHost<TContext> Seed(Action<TContext> seed)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TContext>();
        db.Database.EnsureCreated();
        seed(db);
        db.SaveChanges();
        Commands.Reset();
        return this;
    }

    /// <summary>Reads the database back outside any request, to check what an endpoint really wrote.</summary>
    public T Query<T>(Func<TContext, T> read)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TContext>();
        return read(db);
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _connection.Dispose();
        }
    }
}
