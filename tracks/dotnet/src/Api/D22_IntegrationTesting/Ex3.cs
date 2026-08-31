// d22_integration_testing / ex3 - an identifier a test can predict.
// See lessons/d22_integration_testing/README.md, "Exercise 3".

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/receipts", Issue);
    }

    // 201 with Location /d22/receipts/{reference} and
    // {"reference": "LOAN-M-014-0001", "sequence": 1}. The sequence comes from
    // the injected ReferenceDesk, never from Guid.NewGuid or Random.
    private static IResult Issue(NewReceipt request, ReferenceDesk desk) =>
        throw new NotImplementedException(
            "ex3: POST /d22/receipts is not implemented yet - edit src/Api/D22_IntegrationTesting/Ex3.cs");
}
