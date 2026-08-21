// 03_middleware - given code, not an exercise. Do not edit.
//
// A scratchpad that lives for exactly one request. HttpContext.Items is a
// per-request dictionary: anything you put in it is visible to every
// middleware downstream and to the handler, and it is thrown away when the
// request ends. It is the normal way one middleware passes a fact to another.

namespace DotnetDojo.Api.L03_Middleware;

public static class PipelineTrace
{
    private const string Key = "l03.trace";

    public static void Mark(HttpContext context, string mark)
    {
        if (context.Items[Key] is not List<string> marks)
        {
            marks = [];
            context.Items[Key] = marks;
        }

        marks.Add(mark);
    }

    public static string Read(HttpContext context) =>
        context.Items[Key] is List<string> marks ? string.Join(",", marks) : "";
}
