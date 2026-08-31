// d16_rest_writes - given code, not an exercise. Read it, do not edit it.
//
// A print shop's job queue. Every exercise in this set changes state, so the
// gates do not trust the response body alone: they read the database back
// afterwards to check what was really written - and, on the failure paths,
// that nothing was.

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.D16_RestWrites;

public class Job
{
    public int Id { get; set; }

    public string Title { get; set; } = "";

    public int Copies { get; set; }

    /// <summary>"queued", "printing", "done" or "cancelled".</summary>
    public string Status { get; set; } = "";

    /// <summary>Bumped on every write. ex7 turns this into an ETag.</summary>
    public int Version { get; set; }

    /// <summary>Set by ex4 so a retried POST does not print twice.</summary>
    public string? IdempotencyKey { get; set; }

    /// <summary>Set by ex8 when the job was created as part of a batch.</summary>
    public int? BatchId { get; set; }

    public Batch? Batch { get; set; }
}

public class Batch
{
    public int Id { get; set; }

    public string Reference { get; set; } = "";

    public List<Job> Jobs { get; set; } = [];
}

public class D16Db(DbContextOptions<D16Db> options) : DbContext(options)
{
    public DbSet<Job> Jobs => Set<Job>();

    public DbSet<Batch> Batches => Set<Batch>();
}

public static class D16Queue
{
    /// <summary>Every status a job may be in. Anything else is a 400.</summary>
    public static readonly IReadOnlyList<string> Statuses =
        ["queued", "printing", "done", "cancelled"];

    /// <summary>A job in one of these is finished and can no longer be cancelled.</summary>
    public static readonly IReadOnlyList<string> Finished = ["done", "cancelled"];

    public static JobDto ToDto(Job job) => new(job.Id, job.Title, job.Copies, job.Status);
}

public record JobDto(int Id, string Title, int Copies, string Status);

public record NewJob(string? Title, int Copies);

public record JobReplacement(string? Title, int Copies, string? Status);

public record JobPatch(string? Title, int? Copies, string? Status);

public record CopyChange(int Copies);

public record NewBatch(string? Reference, List<NewJob>? Items);

public record BatchDto(int Id, string Reference, List<int> JobIds);

public class D16Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // The gates replace this with a private in-memory database, per test.
        services.AddDbContext<D16Db>(options => options.UseSqlite("Data Source=dojo-d16.db"));
    }
}
