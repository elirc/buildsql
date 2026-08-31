// d14_projections_dtos / ex6 - two levels of shaping, with a filter inside.
// See lessons/d14_projections_dtos/README.md, "Exercise 6".

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex6 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/directors/slate", Slate);
    }

    // 200 with every director as a DirectorSlate, name A-Z. Inside: ALL of
    // their films (title A-Z) as SlateFilms, and inside each film the rooms
    // of its screenings that still have seats (sold < seats), room A-Z. A
    // film with nothing open still appears, with an empty list. At most two
    // SQL queries.
    private static Task<IResult> Slate(D14Db db) =>
        throw new NotImplementedException(
            "ex6: GET /d14/directors/slate is not implemented yet - edit src/Api/D14_ProjectionsDtos/Ex6.cs");
}
