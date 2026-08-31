// d14_projections_dtos / ex7 - one search box, two shapes, one contract.
// See lessons/d14_projections_dtos/README.md, "Exercise 7".

namespace DotnetDojo.Api.D14_ProjectionsDtos;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d14/search", Search);
    }

    // ?q= searches film titles and director names, case-insensitively.
    // Missing or blank q: 400 as a validation problem with an "errors" entry
    // keyed "q". Otherwise 200 with SearchHits: matching FILMS first (title
    // A-Z, kind "film", year filled), then matching DIRECTORS (name A-Z,
    // kind "director", year null). At most two SQL queries, no internal
    // columns in the body.
    private static Task<IResult> Search(string? q, D14Db db) =>
        throw new NotImplementedException(
            "ex7: GET /d14/search is not implemented yet - edit src/Api/D14_ProjectionsDtos/Ex7.cs");
}
