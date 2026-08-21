// i2_interview_drills / review1 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I2_InterviewDrills;

public class Review1 : IEndpointMapper
{
    public const string KeyHeader = "Idempotency-Key";

    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/i2/review/orders", PlaceOrder);
    }

    private static IResult PlaceOrder(NewDrillOrder request, HttpRequest http, IDrillOrderStore store)
    {
        string key = http.Headers[KeyHeader].FirstOrDefault() ?? "";

        if (key.Length == 0)
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]>
                {
                    [KeyHeader] = ["An Idempotency-Key header is required."],
                });
        }

        // A key we have seen before means the operation already happened. Replay
        // the original result and ignore whatever this body says.
        if (store.Keys.TryGetValue(key, out int alreadyPlaced))
        {
            var existing = store.Find(alreadyPlaced);
            return existing is null ? TypedResults.NotFound() : TypedResults.Ok(existing);
        }

        if (string.IsNullOrWhiteSpace(request.Item))
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["item"] = ["Item is required."] });
        }

        var order = store.Add(request.Item);
        store.Keys[key] = order.Id;

        return TypedResults.Created($"/i2/review/orders/{order.Id}", order);
    }
}
