// 07_rest_crud / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.L07_RestCrud;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/l07/widgets/{id:int}", ReplaceWidget);
    }

    private static async Task<IResult> ReplaceWidget(int id, UpdateWidget request, WidgetDb db)
    {
        var widget = await db.Widgets.FindAsync(id);
        if (widget is null)
        {
            return TypedResults.NotFound();
        }

        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            errors["name"] = ["Name is required."];
        }

        if (string.IsNullOrWhiteSpace(request.Sku))
        {
            errors["sku"] = ["Sku is required."];
        }

        if (request.PriceCents <= 0)
        {
            errors["priceCents"] = ["PriceCents must be greater than zero."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        widget.Name = request.Name!;
        widget.Sku = request.Sku!;
        widget.PriceCents = request.PriceCents;

        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
