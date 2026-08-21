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
        throw new NotImplementedException("ex2: AfterMutatingTheOriginal is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Put one Counter with Value 1 into a List, take list[0] into a local,
    /// set the local's Value to 99, and return list[0].Value.
    /// </summary>
    public static int AfterMutatingAListCopy()
    {
        throw new NotImplementedException("ex2: AfterMutatingAListCopy is not implemented yet - edit this file.");
    }

    /// <summary>The very same three steps, with CounterObject instead.</summary>
    public static int AfterMutatingAListReference()
    {
        throw new NotImplementedException("ex2: AfterMutatingAListReference is not implemented yet - edit this file.");
    }
}
