// 07_rest_crud / ex4 - deleting, and what "gone" means.
// See lessons/07_rest_crud/README.md, "Exercise 4".

namespace DotnetDojo.Api.L07_RestCrud;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapDelete("/l07/widgets/{id:int}", DeleteWidget);
    }

    // 204 when the widget was there and is now gone, 404 when it was not.
    private static Task<IResult> DeleteWidget(int id, WidgetDb db) =>
        throw new NotImplementedException("ex4: DELETE /l07/widgets/{id} is not implemented yet - edit src/Api/L07_RestCrud/Ex4.cs");
}
