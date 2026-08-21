// 07_rest_crud / ex2 - creating, validating, and saying no properly.
// See lessons/07_rest_crud/README.md, "Exercise 2".

namespace DotnetDojo.Api.L07_RestCrud;

public class Ex2 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/l07/widgets", Create);
    }

    // 201 + Location + the created WidgetDto.
    // 400 as a validation problem when the name is blank, the sku is blank, or
    // priceCents is not positive - with one entry in "errors" per bad field,
    // keyed "name", "sku" and "priceCents".
    // 409 when another widget already has that sku.
    private static Task<IResult> Create(CreateWidget request, WidgetDb db) =>
        throw new NotImplementedException("ex2: POST /l07/widgets is not implemented yet - edit src/Api/L07_RestCrud/Ex2.cs");
}
