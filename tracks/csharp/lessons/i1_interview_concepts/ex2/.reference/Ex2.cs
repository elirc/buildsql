// i1_interview_concepts / ex2 - boxing and value-type copies: predict the output.
// See lessons/i1_interview_concepts/README.md, "Exercise 2".

namespace CSharpDojo.I1_InterviewConcepts;

public struct Counter
{
    public int Value;
}

public class CounterObject
{
    public int Value;
}

public static class Boxing
{
    /// <summary>
    /// Box the counter into an object, THEN set the original's Value to 99,
    /// then unbox and return the box's Value.
    /// </summary>
    public static int AfterMutatingTheOriginal(Counter counter)
    {
        object boxed = counter;
        counter.Value = 99;
        return ((Counter)boxed).Value;
    }

    /// <summary>
    /// Put one Counter with Value 1 into a List, take list[0] into a local,
    /// set the local's Value to 99, and return list[0].Value.
    /// </summary>
    public static int AfterMutatingAListCopy()
    {
        List<Counter> counters = new List<Counter> { new Counter { Value = 1 } };
        Counter copy = counters[0];
        copy.Value = 99;
        return counters[0].Value;
    }

    /// <summary>The very same three steps, with CounterObject instead.</summary>
    public static int AfterMutatingAListReference()
    {
        List<CounterObject> counters = new List<CounterObject> { new CounterObject { Value = 1 } };
        CounterObject copy = counters[0];
        copy.Value = 99;
        return counters[0].Value;
    }
}
