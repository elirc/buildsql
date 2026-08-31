// d14_projections_dtos / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/films", List);
    }

    private static async Task<IResult> List(D14Db db)
    {
        // The Select is the contract. It also removes the need for Include:
        // the director's name is reached through the navigation and the
        // provider turns the whole thing into one JOIN.
        var cards = await db.Films
            .OrderByDescending(f => f.Year)
            .ThenBy(f => f.Title)
            .Select(f => new FilmCard(f.Id, f.Title, f.Year, f.Director!.Name))
            .ToListAsync();

        return TypedResults.Ok(cards);
    }
}
