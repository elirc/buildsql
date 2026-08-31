// d08_polymorphism / ex5 - when only some of them can do the extra thing.
// See lessons/d08_polymorphism/README.md, "Exercise 5".

namespace CSharpDojo.D08_Polymorphism;

public abstract class Job
{
    protected Job(string name)
    {
        Name = name;
    }

    public string Name { get; }

    /// <summary>What happens when it runs.</summary>
    public abstract string Run();
}

public class SimpleJob : Job
{
    public SimpleJob(string name)
        : base(name)
    {
    }

    /// <summary>"done".</summary>
    public override string Run()
    {
        throw new NotImplementedException("ex5: SimpleJob.Run is not implemented yet - edit this file.");
    }
}

public class RetryableJob : Job
{
    public RetryableJob(string name, int maxRetries)
        : base(name)
    {
        MaxRetries = maxRetries;
    }

    public int MaxRetries { get; }

    /// <summary>"done".</summary>
    public override string Run()
    {
        throw new NotImplementedException("ex5: RetryableJob.Run is not implemented yet - edit this file.");
    }
}

public static class Runner
{
    /// <summary>
    /// One line per job, joined with ", ": the name, plus " (retries N)" only
    /// for the jobs that actually have retries.
    /// </summary>
    public static string Describe(IEnumerable<Job> jobs)
    {
        throw new NotImplementedException("ex5: Describe is not implemented yet - edit this file.");
    }

    /// <summary>
    /// How many of the jobs are retryable. The answer must be about the
    /// RUNTIME type, so a RetryableJob held in a Job variable still counts.
    /// </summary>
    public static int CountRetryable(IEnumerable<Job> jobs)
    {
        throw new NotImplementedException("ex5: CountRetryable is not implemented yet - edit this file.");
    }
}
