// 07_rest_crud / ex1 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L07_RestCrud;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var widgets = app.MapGroup("/l07/widgets");
        widgets.MapGet("", ListWidgets);
        widgets.MapGet("/{id:int}", GetWidget);
    }

    private static async Task<IResult> ListWidgets(WidgetDb db)
    {
        var widgets = await db.Widgets
            .OrderBy(w => w.Name)
            .Select(w => new WidgetDto(w.Id, w.Name, w.Sku, w.PriceCents))
            .ToListAsync();

        return TypedResults.Ok(widgets);
    }

    private static async Task<IResult> GetWidget(int id, WidgetDb db)
    {
        var widget = await db.Widgets
            .Where(w => w.Id == id)
            .Select(w => new WidgetDto(w.Id, w.Name, w.Sku, w.PriceCents))
            .FirstOrDefaultAsync();

        return widget is null ? TypedResults.NotFound() : TypedResults.Ok(widget);
    }
}
