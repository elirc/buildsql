// i1_interview_concepts / ex4 - reference solution (author only, used by `dojo verify`).

namespace DotnetDojo.Api.I1_InterviewConcepts;

public class Ex4 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPost("/i1/tickets", CreateTicket);
        app.MapPut("/i1/tickets/{id:int}", ReplaceTicket);
    }

    private static IResult CreateTicket(NewTicket request, ITicketStore store)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["title"] = ["Title is required."] });
        }

        var ticket = store.Add(request.Title);
        return TypedResults.Created($"/i1/tickets/{ticket.Id}", ticket);
    }

    private static IResult ReplaceTicket(int id, TicketUpdate request, ITicketStore store)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["title"] = ["Title is required."] });
        }

        if (store.Find(id) is null)
        {
            return TypedResults.NotFound();
        }

        store.Replace(id, request.Title);
        return TypedResults.NoContent();
    }
}
