// d14_projections_dtos / ex5 - a correlated first inside the projection.
// See lessons/d14_projections_dtos/README.md, "Exercise 5".

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/films/next-showing", NextShowings);
    }

    // 200 with EVERY film as a NextShowing, title A-Z: nextDay and nextRoom
    // come from the film's earliest screening (lowest day, ties broken by
    // screening id); a film with no screenings reports null for both. One SQL
    // query for everything.
    private static Task<IResult> NextShowings(D14Db db) =>
        throw new NotImplementedException(
            "ex5: GET /d14/films/next-showing is not implemented yet - edit src/Api/D14_ProjectionsDtos/Ex5.cs");
}
