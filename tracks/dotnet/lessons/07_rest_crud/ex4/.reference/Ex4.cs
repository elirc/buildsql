// 07_rest_crud / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L07_RestCrud;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapDelete("/l07/widgets/{id:int}", DeleteWidget);
    }

    private static async Task<IResult> DeleteWidget(int id, WidgetDb db)
    {
        var widget = await db.Widgets.FindAsync(id);
        if (widget is null)
        {
            return TypedResults.NotFound();
        }

        db.Widgets.Remove(widget);
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
