// d02_route_groups / ex5 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/pantry");

        group.AddEndpointFilter(async (context, next) =>
        {
            int id = context.GetArgument<int>(0);

            if (id > 100)
            {
                return TypedResults.BadRequest($"id {id} is out of range.");
            }

            return await next(context);
        });

        group.MapGet("/{id:int}", (int id) => TypedResults.Text($"item {id}"));
        group.MapGet("/{id:int}/label", (int id) => TypedResults.Text($"label {id}"));
    }
}
