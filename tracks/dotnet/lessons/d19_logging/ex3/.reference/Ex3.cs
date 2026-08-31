// d19_logging / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D19_Logging;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d19/picks/{id:int}/label", Label);
    }

    private static IResult Label(int id, ILogger<Ex3> logger, HttpContext http)
    {
        var pick = D19Warehouse.Find(id);
        if (pick is null)
        {
            return TypedResults.NotFound();
        }

        try
        {
            return TypedResults.Ok(D19Labels.Render(pick.Id));
        }
        catch (Exception ex)
        {
            // The exception goes in the exception parameter, so the entry
            // keeps its type, its stack and its inner exceptions - and the
            // response gets a sentence with none of that in it.
            logger.LogError(ex, "Label render failed for pick {PickId}", pick.Id);

            return TypedResults.Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "The label could not be printed.",
                detail: "The printer refused the job.",
                instance: http.Request.Path);
        }
    }
}
