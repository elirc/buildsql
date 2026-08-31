// d14_sets_queues_stacks / ex3 - a queue: taking, peeking, and postponing.
// See lessons/d14_sets_queues_stacks/README.md, "Exercise 3".

namespace CSharpDojo.D14_SetsQueuesStacks;

public static class Tickets
{
    /// <summary>Removes and returns the front ticket, or null when the queue is empty.</summary>
    public static string? TakeNext(Queue<string> queue)
    {
        return queue.TryDequeue(out string? ticket) ? ticket : null;
    }

    /// <summary>
    /// Moves the front ticket to the BACK of the queue and returns it, or
    /// returns null (touching nothing) when the queue is empty.
    /// </summary>
    public static string? Postpone(Queue<string> queue)
    {
        if (!queue.TryDequeue(out string? ticket))
        {
            return null;
        }

        queue.Enqueue(ticket);
        return ticket;
    }

    /// <summary>
    /// The next <paramref name="count"/> tickets in service order WITHOUT
    /// removing any of them; fewer when the queue is shorter.
    /// </summary>
    public static List<string> UpNext(Queue<string> queue, int count)
    {
        return queue.Take(count).ToList();
    }
}
