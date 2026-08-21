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
        throw new NotImplementedException("ex3: Above is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Three functions returning 0, 1 and 2 - built with a plain
    /// `for (int i = 0; i &lt; 3; i++)` loop, which naively gives 3, 3, 3.
    /// Keep the for loop and fix the capture.
    /// </summary>
    public static List<Func<int>> Indexes()
    {
        throw new NotImplementedException("ex3: Indexes is not implemented yet - edit this file.");
    }
}
