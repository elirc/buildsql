// d08_configuration / ex1 - configuration is a flat dictionary of paths.
// See lessons/d08_configuration/README.md, "Exercise 1".

namespace DotnetDojo.Api.D08_Configuration;

public record SiteResponse(string Title, int PageSize, bool Beta);

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/site", GetSite);
    }

    // 200 with {"title": …, "pageSize": …, "beta": …} read straight out of
    // configuration, from Dojo:D08:Site:Title, :PageSize and :Beta.
    // Missing values fall back to "(untitled)", 10 and false.
    private static IResult GetSite(IConfiguration configuration) =>
        throw new NotImplementedException(
            "ex1: GET /d08/site is not implemented yet - edit src/Api/D08_Configuration/Ex1.cs");
}
