// i1_interview_concepts / ex4 - "review this resource for me."
// See lessons/i1_interview_concepts/README.md, "Exercise 4".

namespace DotnetDojo.Api.I1_InterviewConcepts;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/i1/tickets", CreateTicket);
        app.MapPut("/i1/tickets/{id:int}", ReplaceTicket);
    }

    // Three things are wrong with this create. None of them is a crash.
    private static IResult CreateTicket(NewTicket request, ITicketStore store)
    {
        var ticket = store.Add(request.Title ?? "");
        return TypedResults.Ok(ticket);
    }

    // And this replace is not idempotent.
    private static IResult ReplaceTicket(int id, TicketUpdate request, ITicketStore store)
    {
        if (store.Find(id) is null)
        {
            return TypedResults.Ok();
        }

        if (store.Find(id)!.Title == request.Title)
        {
            return TypedResults.Conflict();
        }

        store.Replace(id, request.Title ?? "");
        return TypedResults.Ok(store.Find(id));
    }
}
