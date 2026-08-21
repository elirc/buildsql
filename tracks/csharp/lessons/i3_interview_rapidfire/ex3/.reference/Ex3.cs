// i3_interview_rapidfire / ex3 - deferred execution and capture, cold. 5 minutes.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 3".

namespace CSharpDojo.I3_InterviewRapidfire;

public static class LazyAndClosures
{
    /// <summary>
    /// A query - not a result - for the numbers strictly above whatever
    /// <paramref name="threshold"/> returns AT THE MOMENT IT IS ENUMERATED.
    /// Do not materialise it.
    /// </summary>
    public static IEnumerable<int> Above(IEnumerable<int> numbers, Func<int> threshold)
    {
        return numbers.Where(number => number > threshold());
    }

    /// <summary>
    /// Three functions returning 0, 1 and 2 - built with a plain
    /// `for (int i = 0; i &lt; 3; i++)` loop, which naively gives 3, 3, 3.
    /// Keep the for loop and fix the capture.
    /// </summary>
    public static List<Func<int>> Indexes()
    {
        List<Func<int>> functions = new List<Func<int>>();
        for (int i = 0; i < 3; i++)
        {
            int captured = i;
            functions.Add(() => captured);
        }

        return functions;
    }
}
