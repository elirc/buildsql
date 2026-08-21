// i1_interview_concepts - given code, not an exercise. Read it, do not edit it.
//
// A two-table tracker and an in-memory ticket store: just enough for the
// interview exercises to be about the bug rather than about the scaffolding.

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.I1_InterviewConcepts;

public class Project
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public List<TaskItem> Tasks { get; set; } = [];
}

public class TaskItem
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public Project? Project { get; set; }

    public string Title { get; set; } = "";

    public bool Done { get; set; }
}

public class TrackerDb(DbContextOptions<TrackerDb> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
}

public record ProjectSummary(int ProjectId, string Name, int TaskCount, int OpenCount);

public record TaskWithProject(int TaskId, string Title, string ProjectName);

// -- the ticket resource used by ex4 -----------------------------------------

public record Ticket(int Id, string Title);

public record NewTicket(string? Title);

public record TicketUpdate(string? Title);

public interface ITicketStore
{
    Ticket? Find(int id);

    Ticket Add(string title);

    bool Replace(int id, string title);
}

public sealed class TicketStore : ITicketStore
{
    private readonly List<Ticket> _tickets = [new(1, "first ticket")];

    private int _next = 2;

    public Ticket? Find(int id)
    {
        lock (_tickets)
        {
            return _tickets.FirstOrDefault(t => t.Id == id);
        }
    }

    public Ticket Add(string title)
    {
        lock (_tickets)
        {
            var ticket = new Ticket(_next++, title);
            _tickets.Add(ticket);
            return ticket;
        }
    }

    public bool Replace(int id, string title)
    {
        lock (_tickets)
        {
            int index = _tickets.FindIndex(t => t.Id == id);
            if (index < 0)
            {
                return false;
            }

            _tickets[index] = _tickets[index] with { Title = title };
            return true;
        }
    }
}

public class I1Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<TrackerDb>(options => options.UseSqlite("Data Source=dojo-i1.db"));
        services.AddSingleton<ITicketStore, TicketStore>();
    }
}
