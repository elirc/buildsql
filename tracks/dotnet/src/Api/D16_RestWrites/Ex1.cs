// d16_rest_writes / ex1 - a create says 201 and says where it put it.
// See lessons/d16_rest_writes/README.md, "Exercise 1".

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex1 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d16/jobs", Create);
    }

    // 201 with the created JobDto, a Location header pointing at
    // /d16/jobs/{newId}, and the row actually saved. New jobs start "queued".
    private static async Task<IResult> Create(NewJob body, D16Db db)
    {
        var job = new Job
        {
            Title = body.Title ?? "",
            Copies = body.Copies,
            Status = "queued",
            Version = 1,
        };

        db.Jobs.Add(job);
        await db.SaveChangesAsync();

        // TODO ex1: 200 with a body is what you say when nothing was created.
        // This one created something, and the client has no idea where.
        return TypedResults.Ok(D16Queue.ToDto(job));
    }
}
