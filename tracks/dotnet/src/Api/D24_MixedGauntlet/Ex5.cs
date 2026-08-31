// d24_mixed_gauntlet / ex5 - a REST write that refuses in problem details.
// See lessons/d24_mixed_gauntlet/README.md, "Exercise 5".

namespace DotnetDojo.Api.D24_MixedGauntlet;

public class Ex5 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d24/exhibits/{id:int}/tickets", Issue);
    }

    // 404 for an unknown exhibit. 409 problem details with type
    // D24Problems.Base + "sold-out" and the extension member "seatsLeft" when
    // the exhibit is full. Otherwise 201 with the TicketDto, a Location header
    // of /d24/tickets/{newId}, and the row actually saved.
    private static Task<IResult> Issue(int id, NewTicket body, D24Db db, HttpContext http) =>
        throw new NotImplementedException(
            "ex5: POST /d24/exhibits/{id}/tickets is not implemented yet - edit src/Api/D24_MixedGauntlet/Ex5.cs");
}
