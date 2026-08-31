// d16_rest_writes / ex8 - reference solution (author only, used by `dojo verify`).

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d16/batches", Create);
        app.MapGet("/d16/batches/{id:int}", Read);
    }

    private static async Task<IResult> Create(NewBatch body, D16Db db)
    {
        // One pass over everything, collecting every problem, before anything
        // is added to the context. Returning on the first error costs the
        // client a round trip per mistake.
        var errors = new Dictionary<string, string[]>();

        string reference = body.Reference?.Trim() ?? "";
        if (reference.Length == 0)
        {
            errors["reference"] = ["A batch needs a reference."];
        }

        var items = body.Items ?? [];
        if (items.Count == 0)
        {
            errors["items"] = ["A batch needs at least one item."];
        }

        for (int i = 0; i < items.Count; i++)
        {
            if (string.IsNullOrWhiteSpace(items[i].Title))
            {
                errors[$"items[{i}].title"] = ["Each item needs a title."];
            }

            if (items[i].Copies < 1)
            {
                errors[$"items[{i}].copies"] = ["Copies must be at least 1."];
            }
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        // The jobs hang off the batch, so ONE SaveChanges writes the batch and
        // every job in it, and EF fills in each BatchId. Two saves would leave
        // an orphan batch behind if the second one failed.
        var batch = new Batch
        {
            Reference = reference,
            Jobs = items
                .Select(item => new Job
                {
                    Title = item.Title!.Trim(),
                    Copies = item.Copies,
                    Status = "queued",
                    Version = 1,
                })
                .ToList(),
        };

        db.Batches.Add(batch);
        await db.SaveChangesAsync();

        var dto = new BatchDto(
            batch.Id,
            batch.Reference,
            batch.Jobs.Select(j => j.Id).OrderBy(x => x).ToList());

        return TypedResults.Created($"/d16/batches/{batch.Id}", dto);
    }

    private static async Task<IResult> Read(int id, D16Db db)
    {
        var batch = await db.Batches
            .Where(b => b.Id == id)
            .Select(b => new BatchDto(
                b.Id,
                b.Reference,
                b.Jobs.OrderBy(j => j.Id).Select(j => j.Id).ToList()))
            .FirstOrDefaultAsync();

        return batch is null ? TypedResults.NotFound() : TypedResults.Ok(batch);
    }
}
