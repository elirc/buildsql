// d03_results_statuscodes / ex8 - CreatedAtRoute, and a conflict that explains itself.
// See lessons/d03_results_statuscodes/README.md, "Exercise 8".

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex8 : IEndpointMapper
{
    public const string RoomRouteName = "d03-desk-room";

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        // TODO ex8: this endpoint needs the name Ex8.RoomRouteName.
        app.MapGet("/d03/desk/rooms/{id:int}", GetRoom);

        app.MapPost("/d03/desk/rooms", CreateRoom);
    }

    // 200 with the room, 404 when there is none.
    private static IResult GetRoom(IDeskStore store, int id) =>
        throw new NotImplementedException(
            "ex8: GET /d03/desk/rooms/{id:int} is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex8.cs");

    // 201 with a Location built from the ROUTE NAME, and the created room.
    // A blank name or a capacity below 1 is a 400. A name the desk already has
    // is a 409 ProblemDetails whose detail names the room.
    private static IResult CreateRoom(IDeskStore store, NewRoom request) =>
        throw new NotImplementedException(
            "ex8: POST /d03/desk/rooms is not implemented yet - edit src/Api/D03_ResultsStatuscodes/Ex8.cs");
}
