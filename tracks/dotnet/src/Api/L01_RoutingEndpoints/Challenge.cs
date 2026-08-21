// 01_routing_endpoints / challenge - the four-way status-code decision.
// See lessons/01_routing_endpoints/README.md, "Challenge".

namespace DotnetDojo.Api.L01_RoutingEndpoints;

public class Challenge : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/l01/orders/{id:int:min(1)}/status", ChangeStatus);
    }

    // 404 unknown order, 400 unknown status value, 409 when the order is
    // already "cancelled", otherwise 204 with no body.
    private static IResult ChangeStatus(int id, StatusChange request) =>
        throw new NotImplementedException("challenge: PUT /l01/orders/{id}/status is not implemented yet - edit src/Api/L01_RoutingEndpoints/Challenge.cs");
}
