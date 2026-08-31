// d18_problemdetails / ex1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d18/sailings/{code}", One);
    }

    private static IResult One(string code, HttpContext http)
    {
        var sailing = D18Ferry.Find(code);
        if (sailing is null)
        {
            // Four fields, four different jobs: the status (repeated in the
            // body because logs carry bodies, not status lines), the title
            // (the same for every occurrence of this problem), the detail
            // (about THIS one), and the instance (which request it was).
            return TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "No such sailing.",
                detail: $"This operator has no sailing '{code}'.",
                instance: http.Request.Path);
        }

        return TypedResults.Ok(new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
    }
}
