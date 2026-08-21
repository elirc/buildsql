// i1_interview_concepts / review1 - spaced-review variant: a lifetime bug and a status code.
// See lessons/i1_interview_concepts/README.md, "Review".

namespace DotnetDojo.Api.I1_InterviewConcepts;

public interface IBasket
{
    Guid Id { get; }

    int Add(string item);
}

public sealed class Basket : IBasket
{
    private readonly List<string> _items = [];

    public Guid Id { get; } = Guid.NewGuid();

    public int Add(string item)
    {
        lock (_items)
        {
            _items.Add(item);
            return _items.Count;
        }
    }
}

public record BasketItem(string? Name);

public record BasketResponse(Guid BasketId, int ItemCount);

public class Review1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // Two customers are sharing a shopping basket. Fix it.
        services.AddSingleton<IBasket, Basket>();
    }
}

public class Review1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/i1/review/basket/items", AddItem);
    }

    // Adding an item creates something. The status code should say so, and the
    // response should say where it lives: /i1/review/basket/items/{itemCount}.
    private static IResult AddItem(BasketItem request, IBasket basket)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return TypedResults.BadRequest();
        }

        int count = basket.Add(request.Name);
        return TypedResults.Ok(new BasketResponse(basket.Id, count));
    }
}
