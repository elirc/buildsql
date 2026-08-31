// d14_projections_dtos / ex1 - the list is a contract, not a table dump.
// See lessons/d14_projections_dtos/README.md, "Exercise 1".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/films", List);
    }

    // 200 with every film as a FilmCard - id, title, year and the DIRECTOR'S
    // NAME - newest year first, ties broken by title A-Z. One SQL query, and
    // neither the director's email nor the film's budget may appear anywhere
    // in the body.
    private static async Task<IResult> List(D14Db db)
    {
        // TODO ex1: this hands entire entity graphs to the serializer. Run it
        // once and read the failure: Film points at Director, Director points
        // back at Films, and the email and budget columns ride along even
        // when serialization survives. Project into FilmCard inside the
        // query.
        var films = await db.Films
            .Include(f => f.Director)
            .OrderByDescending(f => f.Year)
            .ThenBy(f => f.Title)
            .ToListAsync();

        return TypedResults.Ok(films);
    }
}
