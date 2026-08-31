// d18_problemdetails / ex4 - reference solution (author only, used by `dojo verify`).

using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

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

    public static void Configure(IApplicationBuilder pipeline)
    {
        pipeline.UseExceptionHandler(errorApp => errorApp.Run(async context =>
        {
            var error = context.Features.Get<IExceptionHandlerFeature>()?.Error;

            // A domain exception is a KNOWN failure that happened to be thrown.
            // Anything else is a fault, and the client is told nothing about
            // it - the message here holds a production connection string.
            var problem = error is SailingNotFoundException missing
                ? new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Type = D18Ferry.ProblemBase + "sailing-not-found",
                    Title = "No such sailing.",
                    Detail = $"This operator has no sailing '{missing.Code}'.",
                    Instance = context.Request.Path,
                }
                : new ProblemDetails
                {
                    Status = StatusCodes.Status500InternalServerError,
                    Type = D18Ferry.ProblemBase + "internal",
                    Title = "Something went wrong at our end.",
                    Detail = "The request could not be completed.",
                    Instance = context.Request.Path,
                };

            context.Response.StatusCode = problem.Status!.Value;

            await context.Response.WriteAsJsonAsync(
                problem, options: null, contentType: "application/problem+json");
        }));
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
