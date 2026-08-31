// d14_projections_dtos / ex2 - one query, a name and its titles.
// See lessons/d14_projections_dtos/README.md, "Exercise 2".

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/directors/{id:int}", Detail);
    }

    // 200 with a DirectorFilms - the director's name and their film TITLES,
    // oldest year first - or 404. One SQL query for the whole answer.
    private static Task<IResult> Detail(int id, D14Db db) =>
        throw new NotImplementedException(
            "ex2: GET /d14/directors/{id} is not implemented yet - edit src/Api/D14_ProjectionsDtos/Ex2.cs");
}
