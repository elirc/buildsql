// d22_integration_testing / ex3 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex3 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/receipts", Issue);
    }

    // Every part of the reference comes from something the caller supplied or
    // the container handed over: the card from the body, the number from the
    // injected desk. Same inputs, same output, on every host.
    private static IResult Issue(NewReceipt request, ReferenceDesk desk)
    {
        int sequence = desk.Next();
        string reference = $"LOAN-{request.CardId.ToUpperInvariant()}-{sequence:D4}";

        return TypedResults.Created($"/d22/receipts/{reference}", new Receipt(reference, sequence));
    }
}
