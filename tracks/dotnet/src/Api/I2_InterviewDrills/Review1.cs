// i2_interview_drills / review1 - spaced-review drill: make a POST safe to retry.
// See lessons/i2_interview_drills/README.md, "Review".

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/i2/review/orders", PlaceOrder);
    }

    // POST is not idempotent, so a client that retries after a timeout can
    // place the same order twice. The fix the industry settled on is a client
    // -supplied Idempotency-Key header that the server remembers.
    //
    // no Idempotency-Key header -> 400 validation problem keyed "Idempotency-Key"
    // blank item                -> 400 validation problem keyed "item"
    // a key never seen before   -> 201, Location /i2/review/orders/{id}, the order
    // a key seen before         -> 200 with the SAME order as the first time, and
    //                              nothing new created, whatever the body says
    private static IResult PlaceOrder(NewDrillOrder request, HttpRequest http, IDrillOrderStore store) =>
        throw new NotImplementedException("review1: POST /i2/review/orders is not implemented yet - edit src/Api/I2_InterviewDrills/Review1.cs");
}
