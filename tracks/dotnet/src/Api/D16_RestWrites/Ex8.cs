// d16_rest_writes / ex8 - a batch is one write or none.
// See lessons/d16_rest_writes/README.md, "Exercise 8".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d16/batches", Create);
        app.MapGet("/d16/batches/{id:int}", Read);
    }

    // 400, as a validation problem, when the reference is blank ("reference"),
    // the items list is missing or empty ("items"), or any item has a blank
    // title ("items[i].title") or copies below 1 ("items[i].copies") - every
    // offending key present at once, and NOTHING written. Otherwise 201 with
    // Location /d16/batches/{id} and a BatchDto: the batch id, its reference,
    // and the ids of the jobs it created, ascending. Each job is "queued" and
    // carries the batch id.
    private static Task<IResult> Create(NewBatch body, D16Db db) =>
        throw new NotImplementedException(
            "ex8: POST /d16/batches is not implemented yet - edit src/Api/D16_RestWrites/Ex8.cs");

    // 200 with the BatchDto, or 404.
    private static Task<IResult> Read(int id, D16Db db) =>
        throw new NotImplementedException(
            "ex8: GET /d16/batches/{id} is not implemented yet - edit src/Api/D16_RestWrites/Ex8.cs");
}
