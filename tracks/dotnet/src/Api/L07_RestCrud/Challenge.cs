// 07_rest_crud / challenge - a collection endpoint that a real client can live with.
// See lessons/07_rest_crud/README.md, "Challenge".

namespace DotnetDojo.Api.L07_RestCrud;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l07/widgets/search", Search);
    }

    // 200 with one page of WidgetDto, plus an "X-Total-Count" response header
    // holding the number of matching rows.
    //   sort: "name" (default) or "price"
    //   page: 1-based, default 1
    //   size: default 3, at most 50
    // Anything outside those rules is a 400 validation problem, keyed by the
    // offending parameter.
    private static Task<IResult> Search(string? sort, int? page, int? size, HttpResponse response, WidgetDb db) =>
        throw new NotImplementedException("challenge: GET /l07/widgets/search is not implemented yet - edit src/Api/L07_RestCrud/Challenge.cs");
}
