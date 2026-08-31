// d03_results_statuscodes / ex7 - reference solution (author only, used by `dojo verify`).

using Microsoft.AspNetCore.Http.HttpResults;

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d03/rooms/{id:int}", GetRoom);
    }

    private static Results<Ok<DeskRoom>, NotFound, BadRequest<string>> GetRoom(
        IDeskStore store, int id)
    {
        if (id > 100)
        {
            return TypedResults.BadRequest($"id {id} is out of range.");
        }

        var room = store.FindRoom(id);

        if (room is null)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(room);
    }
}
