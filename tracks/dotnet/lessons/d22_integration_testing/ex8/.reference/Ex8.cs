// d22_integration_testing / ex8 - reference solution (author only, used by `dojo verify`).

using Microsoft.Extensions.Options;

namespace DotnetDojo.Api.D22_IntegrationTesting;

public class Ex8 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/d22/loans", Issue);
        app.MapGet("/d22/loans/{id:int}", One);
    }

    private static IResult Issue(
        NewLoan request,
        LoanBook loans,
        TimeProvider clock,
        IOptions<LoanPolicyOptions> policy,
        IOverdueNotifier notifier)
    {
        // Shape first: a blank field is a bad request, not a missing member.
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(request.CardId))
        {
            errors["cardId"] = ["cardId is required."];
        }

        if (string.IsNullOrWhiteSpace(request.Code))
        {
            errors["code"] = ["code is required."];
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        // Then existence: a well-formed request about things that are not there.
        var member = D22Library.FindMember(request.CardId);
        if (member is null)
        {
            return TypedResults.NotFound();
        }

        var title = D22Library.FindBook(request.Code);
        if (title is null)
        {
            return TypedResults.NotFound();
        }

        // Then the rule: everything exists, the desk simply says no. The count
        // spans the seeded loans AND the ones this host has issued.
        var limits = policy.Value;
        int open = D22Library.LoansFor(member.CardId).Count
            + loans.Issued().Count(l => l.CardId == member.CardId);

        if (open >= limits.MaxPerMember)
        {
            return TypedResults.Json(
                new LoanRefused(member.CardId, open, limits.MaxPerMember),
                statusCode: 409);
        }

        // The work, with every input injected.
        var overdue = D22Library.MostOverdueFor(member.CardId);
        if (overdue is not null)
        {
            notifier.Notify(overdue.CardId, overdue.Code, overdue.DaysOverdue);
        }

        var now = clock.GetUtcNow();
        var issued = new IssuedLoan(
            loans.NextId(),
            member.CardId,
            title.Code,
            title.Title,
            D22Library.Stamp(now),
            D22Library.Stamp(now.AddDays(limits.LoanDays)),
            overdue is not null);

        loans.Add(issued);

        return TypedResults.Created($"/d22/loans/{issued.Id}", issued);
    }

    private static IResult One(int id, LoanBook loans)
    {
        var loan = loans.Find(id);
        if (loan is null)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(loan);
    }
}
