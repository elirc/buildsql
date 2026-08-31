// d14_projections_dtos / ex8 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/dashboard", Get);
    }

    private static async Task<IResult> Get(D14Db db)
    {
        // Query 1: one scalar.
        int films = await db.Films.CountAsync();

        // Query 2: every screening statistic in a single grouped aggregate.
        // GroupBy over a constant is the idiom for "aggregate the whole table".
        var totals = await db.Screenings
            .GroupBy(s => 1)
            .Select(g => new
            {
                Count = g.Count(),
                Sold = g.Sum(s => s.Sold),
                SoldOut = g.Sum(s => s.Sold >= s.Seats ? 1 : 0),
            })
            .FirstOrDefaultAsync();

        // Query 3: the ranking, computed and ordered and cut to three by the
        // database. Integer division is what SQL does with two integers, which
        // is exactly the rounding the contract asks for.
        // The ordering has to be over an anonymous type, not over the record:
        // EF cannot see through a positional record's constructor to know that
        // `t.Percent` is the expression it just built, so ordering by it fails
        // to translate. Shape into TopFilm after the three rows are back.
        var top = await db.Films
            .Where(f => f.Screenings.Any())
            .Select(f => new
            {
                f.Title,
                Percent = f.Screenings.Sum(s => s.Sold) * 100 / f.Screenings.Sum(s => s.Seats),
            })
            .OrderByDescending(x => x.Percent)
            .ThenBy(x => x.Title)
            .Take(3)
            .ToListAsync();

        return TypedResults.Ok(new Dashboard(
            films,
            totals?.Count ?? 0,
            totals?.Sold ?? 0,
            totals?.SoldOut ?? 0,
            top.Select(x => new TopFilm(x.Title, x.Percent)).ToList()));
    }
}
