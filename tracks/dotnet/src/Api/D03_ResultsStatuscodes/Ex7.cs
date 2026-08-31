// d03_results_statuscodes / ex7 - the return type that lists its own outcomes.
// See lessons/d03_results_statuscodes/README.md, "Exercise 7".

using Microsoft.AspNetCore.Http.HttpResults;

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex7 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d03/rooms/{id:int}", GetRoom);
    }

    // Keep the union return type. An id above 100 is a 400 naming the id; an id
    // the desk has no room for is a 404; anything else is a 200 with the room.
    private static Results<Ok<DeskRoom>, NotFound, BadRequest<string>> GetRoom(
        IDeskStore store, int id) =>
        throw new NotImplementedException(
            "ex7: GET /d03/rooms/{id:int} is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex7.cs");
}
