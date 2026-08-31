// d02_route_groups / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D02_RouteGroups;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/d02/kitchen");

        group.AddEndpointFilter(async (context, next) =>
        {
            var http = context.HttpContext;
            string chef = http.Request.Headers["X-Chef"].ToString();

            if (string.IsNullOrWhiteSpace(chef))
            {
                return TypedResults.StatusCode(StatusCodes.Status401Unauthorized);
            }

            http.Response.Headers["X-Chef-Ack"] = chef;

            return await next(context);
        });

        group.MapGet("/orders", () => TypedResults.Text("orders"));
        group.MapGet("/status", () => TypedResults.Text("open"));
    }
}
