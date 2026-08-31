// d14_projections_dtos / ex4 - the films nobody is showing.
// See lessons/d14_projections_dtos/README.md, "Exercise 4".

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/films/quiet", Quiet);
    }

    // 200 with every film that has NO screenings at all, as a QuietFilm,
    // title A-Z. One SQL query - the absence test runs in the database.
    private static Task<IResult> Quiet(D14Db db) =>
        throw new NotImplementedException(
            "ex4: GET /d14/films/quiet is not implemented yet - edit src/Api/D14_ProjectionsDtos/Ex4.cs");
}
