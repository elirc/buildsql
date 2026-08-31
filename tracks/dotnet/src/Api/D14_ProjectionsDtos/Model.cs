// d14_projections_dtos - given code, not an exercise. Read it, do not edit it.
//
// A small cinema: directors, their films, and the screenings of each film.
// Two columns exist for the back office only and must never reach a client:
// Director.Email and Film.BudgetCents. The gates read the raw response body
// looking for them, and they count SQL commands - a correct body produced by
// hauling entity graphs into memory still fails here.

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Director
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    /// <summary>Internal. Must never reach a client.</summary>
    public string Email { get; set; } = "";

    public List<Film> Films { get; set; } = [];
}

public class Film
{
    public int Id { get; set; }

    public string Title { get; set; } = "";

    public int Year { get; set; }

    public int Minutes { get; set; }

    /// <summary>Internal. Must never reach a client.</summary>
    public int BudgetCents { get; set; }

    public int DirectorId { get; set; }

    public Director? Director { get; set; }

    public List<Screening> Screenings { get; set; } = [];
}

public class Screening
{
    public int Id { get; set; }

    public int FilmId { get; set; }

    public Film? Film { get; set; }

    public string Room { get; set; } = "";

    /// <summary>Festival day, 1..7.</summary>
    public int Day { get; set; }

    public int Seats { get; set; }

    public int Sold { get; set; }
}

public class D14Db(DbContextOptions<D14Db> options) : DbContext(options)
{
    public DbSet<Director> Directors => Set<Director>();

    public DbSet<Film> Films => Set<Film>();

    public DbSet<Screening> Screenings => Set<Screening>();
}

public record FilmCard(int Id, string Title, int Year, string Director);

public record DirectorFilms(string Name, List<string> Titles);

public record ScreeningBoardRow(int Id, string Film, string Room, string Status);

public record QuietFilm(string Title, int Year);

public record NextShowing(int Id, string Title, int? NextDay, string? NextRoom);

public record SlateFilm(string Title, List<string> OpenRooms);

public record DirectorSlate(string Name, List<SlateFilm> Films);

public record SearchHit(string Kind, string Label, int? Year);

public record TopFilm(string Title, int Percent);

public record Dashboard(int Films, int Screenings, int SeatsSold, int SoldOut, List<TopFilm> Top);

public class D14Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // The gates replace this with a private in-memory database, per test.
        services.AddDbContext<D14Db>(options => options.UseSqlite("Data Source=dojo-d14.db"));
    }
}
