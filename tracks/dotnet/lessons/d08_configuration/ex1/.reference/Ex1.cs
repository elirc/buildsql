// d08_configuration / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D08_Configuration;

public record SiteResponse(string Title, int PageSize, bool Beta);

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d08/site", GetSite);
    }

    private static IResult GetSite(IConfiguration configuration)
    {
        string title = configuration["Dojo:D08:Site:Title"] ?? "(untitled)";
        int pageSize = configuration.GetValue("Dojo:D08:Site:PageSize", 10);
        bool beta = configuration.GetValue("Dojo:D08:Site:Beta", false);

        return TypedResults.Ok(new SiteResponse(title, pageSize, beta));
    }
}
