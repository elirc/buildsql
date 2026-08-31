// d19_logging / ex3 - the exception has its own parameter.
// See lessons/d19_logging/README.md, "Exercise 3".

namespace DotnetDojo.Api.D19_Logging;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d19/picks/{id:int}/label", Label);
    }

    // D19Labels.Render always throws, and its message carries a printer token.
    // Catch it, log one ERROR entry with the exception in the exception
    // parameter and a PickId property, and answer 500 as problem details that
    // says nothing about the exception.
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
            // TODO ex3: the exception is flattened into the message, so the
            // log has no stack trace and no exception type - and then the same
            // text is handed to the client, token and all.
            logger.LogError("Label failed for pick " + id + ": " + ex.Message);

            return TypedResults.Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "The label could not be printed.",
                detail: ex.Message,
                instance: http.Request.Path);
        }
    }
}
