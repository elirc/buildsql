// d14_projections_dtos / ex6 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/directors/slate", Slate);
    }

    private static async Task<IResult> Slate(D14Db db)
    {
        // Three levels of shape in one expression tree. The filter sits on the
        // INNER collection, so a film with nothing open keeps its place with an
        // empty list - filtering the outer query would have dropped it.
        var slates = await db.Directors
            .OrderBy(d => d.Name)
            .Select(d => new DirectorSlate(
                d.Name,
                d.Films
                    .OrderBy(f => f.Title)
                    .Select(f => new SlateFilm(
                        f.Title,
                        f.Screenings
                            .Where(s => s.Sold < s.Seats)
                            .OrderBy(s => s.Room)
                            .Select(s => s.Room)
                            .ToList()))
                    .ToList()))
            .ToListAsync();

        return TypedResults.Ok(slates);
    }
}
