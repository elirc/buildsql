// d18_problemdetails / ex2 - the type a client can switch on.
// See lessons/d18_problemdetails/README.md, "Exercise 2".

namespace DotnetDojo.Api.D18_ProblemDetails;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d18/sailings/{code}/book", Book);
    }

    // 404 problem details for an unknown code. 409 problem details when the
    // sailing cannot take that many: type D18Ferry.ProblemBase +
    // "sailing-full", plus the extension members "sailingCode" and
    // "seatsLeft". Otherwise 200 with the SailingDto.
    private static IResult Book(string code, SeatRequest body) =>
        throw new NotImplementedException(
            "ex2: POST /d18/sailings/{code}/book is not implemented yet - edit src/Api/D18_ProblemDetails/Ex2.cs");
}
