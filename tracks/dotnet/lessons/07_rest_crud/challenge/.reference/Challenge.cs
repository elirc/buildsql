// 07_rest_crud / challenge - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L07_RestCrud;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l07/widgets/search", Search);
    }

    private static async Task<IResult> Search(
        string? sort, int? page, int? size, HttpResponse response, WidgetDb db)
    {
        string order = sort ?? "name";
        int wanted = page ?? 1;
        int perPage = size ?? 3;

        var errors = new Dictionary<string, string[]>();

        if (order != "name" && order != "price")
        {
            errors["sort"] = ["sort must be 'name' or 'price'."];
        }

        if (wanted < 1)
        {
            errors["page"] = ["page is 1-based."];
        }

        if (perPage < 1 || perPage > 50)
        {
            errors["size"] = ["size must be between 1 and 50."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        int total = await db.Widgets.CountAsync();

        IQueryable<Widget> query = order == "price"
            ? db.Widgets.OrderBy(w => w.PriceCents).ThenBy(w => w.Name)
            : db.Widgets.OrderBy(w => w.Name);

        var items = await query
            .Skip((wanted - 1) * perPage)
            .Take(perPage)
            .Select(w => new WidgetDto(w.Id, w.Name, w.Sku, w.PriceCents))
            .ToListAsync();

        response.Headers["X-Total-Count"] = total.ToString();
        return TypedResults.Ok(items);
    }
}
