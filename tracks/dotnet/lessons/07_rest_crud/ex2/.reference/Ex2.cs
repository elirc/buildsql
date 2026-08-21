// 07_rest_crud / ex2 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L07_RestCrud;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l07/widgets", Create);
    }

    private static async Task<IResult> Create(CreateWidget request, WidgetDb db)
    {
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

        if (await db.Widgets.AnyAsync(w => w.Sku == request.Sku))
        {
            return TypedResults.Problem(
                title: "Duplicate sku",
                detail: $"A widget with sku '{request.Sku}' already exists.",
                statusCode: StatusCodes.Status409Conflict);
        }

        var widget = new Widget
        {
            Name = request.Name!,
            Sku = request.Sku!,
            PriceCents = request.PriceCents,
        };

        db.Widgets.Add(widget);
        await db.SaveChangesAsync();

        return TypedResults.Created(
            $"/l07/widgets/{widget.Id}",
            new WidgetDto(widget.Id, widget.Name, widget.Sku, widget.PriceCents));
    }
}
