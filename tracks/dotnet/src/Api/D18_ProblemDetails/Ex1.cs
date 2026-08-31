// d18_problemdetails / ex1 - a 404 that explains itself.
// See lessons/d18_problemdetails/README.md, "Exercise 1".

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d18/sailings/{code}", One);
    }

    // 200 with a SailingDto, or 404 as problem details: status 404, a title,
    // a detail naming the code that was asked for, and instance set to the
    // path of this request.
    private static IResult One(string code, HttpContext http)
    {
        var sailing = D18Ferry.Find(code);
        if (sailing is null)
        {
            // TODO ex1: a bare 404 has no body at all, so a client that hits
            // it learns nothing and a log line records nothing.
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
    }
}
