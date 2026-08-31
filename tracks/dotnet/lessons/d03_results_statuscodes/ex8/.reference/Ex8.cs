// d03_results_statuscodes / ex8 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D03_ResultsStatuscodes;

public class Ex8 : IEndpointMapper
{
    public const string RoomRouteName = "d03-desk-room";

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/d03/desk/rooms/{id:int}", GetRoom).WithName(RoomRouteName);

        app.MapPost("/d03/desk/rooms", CreateRoom);
    }

    private static IResult GetRoom(IDeskStore store, int id)
    {
        var room = store.FindRoom(id);

        return room is null ? TypedResults.NotFound() : TypedResults.Ok(room);
    }

    private static IResult CreateRoom(IDeskStore store, NewRoom request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Capacity < 1)
        {
            return TypedResults.BadRequest("name is required and capacity must be at least 1.");
        }

        if (store.FindRoom(request.Name) is not null)
        {
            return TypedResults.Problem(
                detail: $"The desk already has a room called '{request.Name}'.",
                statusCode: StatusCodes.Status409Conflict,
                title: "Duplicate room");
        }

        var room = store.AddRoom(request.Name, request.Capacity);

        return TypedResults.CreatedAtRoute(room, RoomRouteName, new { id = room.Id });
    }
}
