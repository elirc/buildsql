// 07_rest_crud / ex3 - PUT replaces, and does it the same way every time.
// See lessons/07_rest_crud/README.md, "Exercise 3".

namespace DotnetDojo.Api.L07_RestCrud;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/l07/widgets/{id:int}", ReplaceWidget);
    }

    // 404 when there is no such widget.
    // 400 as a validation problem for the same three rules as ex2.
    // 204 otherwise, having replaced the client-visible fields - and only
    // those.
    private static Task<IResult> ReplaceWidget(int id, UpdateWidget request, WidgetDb db) =>
        throw new NotImplementedException("ex3: PUT /l07/widgets/{id} is not implemented yet - edit src/Api/L07_RestCrud/Ex3.cs");
}
