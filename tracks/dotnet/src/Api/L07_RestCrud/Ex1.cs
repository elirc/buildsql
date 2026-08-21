// 07_rest_crud / ex1 - reading a resource, without leaking the entity.
// See lessons/07_rest_crud/README.md, "Exercise 1".

namespace DotnetDojo.Api.L07_RestCrud;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var widgets = app.MapGroup("/l07/widgets");
        widgets.MapGet("", ListWidgets);
        widgets.MapGet("/{id:int}", GetWidget);
    }

    // 200 with every widget as a WidgetDto, name ascending.
    private static Task<IResult> ListWidgets(WidgetDb db) =>
        throw new NotImplementedException("ex1: GET /l07/widgets is not implemented yet - edit src/Api/L07_RestCrud/Ex1.cs");

    // 200 with one WidgetDto, or 404.
    private static Task<IResult> GetWidget(int id, WidgetDb db) =>
        throw new NotImplementedException("ex1: GET /l07/widgets/{id} is not implemented yet - edit src/Api/L07_RestCrud/Ex1.cs");
}
