// d22_integration_testing - given code, not an exercise. Read it, do not edit it.
//
// A library loans desk: five books, three members, five loans already out.
// The catalogue and the members are static and read-only; everything the
// endpoints CHANGE lives in one of the small stores below, and every one of
// those stores is registered as a singleton in the container at the bottom of
// this file.
//
// That is the whole subject of this drill set. Each gate builds its own
// `new DojoWebFactory()`, which builds its own service provider - so a
// singleton is per-host and two tests cannot see each other's writes. A
// `static` field is per-PROCESS, and every host in the test run shares it.
//
// The same idea applied to the other things a handler reaches for: the clock,
// an outbound notifier, a configured limit. If the handler asks the container
// for them, a test can hand it different ones. If the handler reaches out and
// grabs them itself, nobody can.

using System.Globalization;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DotnetDojo.Api.D22_IntegrationTesting;

public sealed record Book(string Code, string Title, int Copies);

public sealed record Member(string CardId, string Name, string Tier);

/// <summary>A loan already out when the process started. DaysOverdue 0 means it is not overdue.</summary>
public sealed record Loan(int Id, string CardId, string Code, int DaysOverdue);

public static class D22Library
{
    public static readonly IReadOnlyList<Book> Books =
    [
        new("bk-104", "The Pragmatic Programmer", 2),
        new("bk-101", "Clean Code", 3),
        new("bk-107", "Designing Data-Intensive Applications", 1),
        new("bk-102", "Domain-Driven Design", 1),
        new("bk-109", "Refactoring", 2),
    ];

    public static readonly IReadOnlyList<Member> Members =
    [
        new("m-014", "Ada Okafor", "standard"),
        new("m-007", "Bram Kelly", "staff"),
        new("m-021", "Cleo Marsh", "standard"),
    ];

    /// <summary>The loans already on the desk. Read-only - nothing in this set edits them.</summary>
    public static readonly IReadOnlyList<Loan> Loans =
    [
        new(1, "m-014", "bk-101", 0),
        new(2, "m-007", "bk-102", 3),
        new(3, "m-014", "bk-104", 0),
        new(4, "m-021", "bk-101", 11),
        new(5, "m-007", "bk-109", 1),
    ];

    /// <summary>The default loan length used by ex2. ex5, ex7 and ex8 read theirs from configuration.</summary>
    public const int DefaultLoanDays = 14;

    public static Book? FindBook(string? code) =>
        Books.FirstOrDefault(b => b.Code == code);

    public static Member? FindMember(string? cardId) =>
        Members.FirstOrDefault(m => m.CardId == cardId);

    public static Loan? FindLoan(int id) =>
        Loans.FirstOrDefault(l => l.Id == id);

    /// <summary>The seeded loans held by one member, id ascending.</summary>
    public static IReadOnlyList<Loan> LoansFor(string cardId) =>
        [.. Loans.Where(l => l.CardId == cardId).OrderBy(l => l.Id)];

    /// <summary>The single most overdue seeded loan of a member, or null when none is overdue.</summary>
    public static Loan? MostOverdueFor(string cardId) =>
        Loans.Where(l => l.CardId == cardId && l.DaysOverdue > 0)
            .OrderByDescending(l => l.DaysOverdue)
            .ThenBy(l => l.Id)
            .FirstOrDefault();

    /// <summary>The one timestamp format this lesson prints. Use it - the gates compare literally.</summary>
    public static string Stamp(DateTimeOffset at) =>
        at.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
}

// -- the seams --------------------------------------------------------------

/// <summary>An outbound call. ex4, ex7 and ex8 must go through this, never through a `new`.</summary>
public interface IOverdueNotifier
{
    void Notify(string cardId, string code, int daysOverdue);
}

/// <summary>What the application registers. It does nothing observable on purpose - a test replaces it.</summary>
public sealed class DeskLogNotifier : IOverdueNotifier
{
    public void Notify(string cardId, string code, int daysOverdue)
    {
        // In a real desk this would print a slip or queue an email. Here the
        // point is only that the endpoint asked SOMETHING to do it.
    }
}

/// <summary>Bound from configuration section Dojo:D22:Loans. The values here are the defaults.</summary>
public sealed class LoanPolicyOptions
{
    public int MaxPerMember { get; set; } = 3;

    public int LoanDays { get; set; } = 14;

    public int GraceDays { get; set; } = 2;
}

// -- the stores (all singletons, all per-host) -------------------------------

public sealed record Hold(int Id, string Code, string CardId);

/// <summary>ex1. Holds placed on this host, and nowhere else.</summary>
public sealed class HoldDesk
{
    private readonly object _gate = new();
    private readonly List<Hold> _holds = [];
    private int _lastId;

    public Hold Place(string code, string cardId)
    {
        lock (_gate)
        {
            var hold = new Hold(++_lastId, code, cardId);
            _holds.Add(hold);
            return hold;
        }
    }

    public IReadOnlyList<Hold> All()
    {
        lock (_gate)
        {
            return [.. _holds];
        }
    }
}

/// <summary>ex3. Hands out 1, 2, 3, ... on this host. A fresh host starts again at 1.</summary>
public sealed class ReferenceDesk
{
    private int _last;

    public int Next() => Interlocked.Increment(ref _last);
}

/// <summary>ex6. Which loan ids have been shelved on this host. Add returns false for a repeat.</summary>
public sealed class ReturnsLog
{
    private readonly object _gate = new();
    private readonly HashSet<int> _ids = [];

    /// <summary>True when this id had not been recorded before, false when it is a repeat.</summary>
    public bool Add(int loanId)
    {
        lock (_gate)
        {
            return _ids.Add(loanId);
        }
    }

    /// <summary>Every recorded id, in no particular order. Sorting is the caller's job.</summary>
    public int[] Snapshot()
    {
        lock (_gate)
        {
            return [.. _ids];
        }
    }
}

public sealed record IssuedLoan(
    int Id,
    string CardId,
    string Code,
    string Title,
    string IssuedAt,
    string DueAt,
    bool Warned);

/// <summary>ex8. Loans issued on this host. Ids start at 1001 so they never collide with the seed.</summary>
public sealed class LoanBook
{
    private readonly object _gate = new();
    private readonly List<IssuedLoan> _issued = [];
    private int _lastId = 1000;

    public int NextId()
    {
        lock (_gate)
        {
            return ++_lastId;
        }
    }

    public void Add(IssuedLoan loan)
    {
        lock (_gate)
        {
            _issued.Add(loan);
        }
    }

    public IssuedLoan? Find(int id)
    {
        lock (_gate)
        {
            return _issued.FirstOrDefault(l => l.Id == id);
        }
    }

    public IReadOnlyList<IssuedLoan> Issued()
    {
        lock (_gate)
        {
            return [.. _issued];
        }
    }
}

// -- request and response shapes --------------------------------------------

public record NewHold(string Code, string CardId);

public record NewReceipt(string CardId);

public record Receipt(string Reference, int Sequence);

public record DueDate(string IssuedAt, string DueAt, int LoanDays);

public record SweepReport(int Notified);

public record Allowance(string CardId, string Name, int OnLoan, int MaxLoans, bool CanBorrow);

public record ReturnReceipt(int LoanId, bool AlreadyReturned, int ReturnedCount);

public record ReturnsReport(List<int> Returned, int Count);

public record Renewal(int LoanId, string CardId, string Code, string RenewedAt, string DueAt);

public record RenewalRefused(int LoanId, int DaysOverdue, int GraceDays);

public record NewLoan(string? CardId, string? Code);

public record LoanRefused(string CardId, int Open, int MaxPerMember);

// -- registration ------------------------------------------------------------
//
// This lives in Model.cs, not in an exercise file, on purpose: a half-finished
// exercise must never be able to unregister a service. In a minimal API an
// unregistered handler parameter is inferred as a request BODY, and a GET with
// an inferred body fails at startup - which would take down every other
// lesson's gates, not just this one's.

public class Services : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // The clock. TryAdd, because the host may already have registered one.
        services.TryAddSingleton<TimeProvider>(TimeProvider.System);

        // The stores. Singleton means one per host, and a gate is one host.
        services.AddSingleton<HoldDesk>();
        services.AddSingleton<ReferenceDesk>();
        services.AddSingleton<ReturnsLog>();
        services.AddSingleton<LoanBook>();

        // The outbound seam, and the limits a test may want to change.
        services.AddSingleton<IOverdueNotifier, DeskLogNotifier>();
        services.Configure<LoanPolicyOptions>(configuration.GetSection("Dojo:D22:Loans"));
    }
}
