// d18_problemdetails / ex4 - the exception nobody planned for.
// See lessons/d18_problemdetails/README.md, "Exercise 4".

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var pipeline = app.CreateApplicationBuilder();

        Configure(pipeline);
        pipeline.Run(Handle);

        app.Map("/d18/sailings/{code}/manifest", pipeline.Build());
    }

    // TODO ex4: nothing in this branch catches anything, so D18Booking.Manifest
    // throwing takes the whole request down. Add an exception handler that
    // turns SailingNotFoundException into a 404 problem details and ANY other
    // exception into a 500 problem details that says nothing about the
    // exception - no message, no type name, no stack.
    public static void Configure(IApplicationBuilder pipeline)
    {
    }

    // Given: the happy path, which throws rather than returning failures.
    private static async Task Handle(HttpContext http)
    {
        string code = (string?)http.Request.RouteValues["code"] ?? "";
        var sailing = D18Booking.Manifest(code);

        await http.Response.WriteAsJsonAsync(
            new SailingDto(sailing.Code, sailing.Route, sailing.Seats, sailing.Left));
    }
}
