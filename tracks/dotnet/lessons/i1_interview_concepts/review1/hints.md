## Hint 1

Two independent bugs, in two different files' worth of thinking but one small
file of code. One is about *lifetime*; one is about *status codes*.

Read the gate's two failures separately — they have nothing to do with each
other, and fixing one will not move the other.

## Hint 2

The lifetime: a shopping basket belongs to one customer for the length of one
request. Right now it is registered as one object for the entire application,
which means every customer is putting things in the same basket. There is exactly
one lifetime that means "one per request".

The status code: adding an item creates something, so the answer is 201 with a
`Location` header. The gate wants `/i1/review/basket/items/{itemCount}`.

## Hint 3

```csharp
services.AddScoped<IBasket, Basket>();
```

and

```csharp
int count = basket.Add(request.Name);
return TypedResults.Created(
    $"/i1/review/basket/items/{count}",
    new BasketResponse(basket.Id, count));
```

The 400 for a blank name already works — leave it alone.
