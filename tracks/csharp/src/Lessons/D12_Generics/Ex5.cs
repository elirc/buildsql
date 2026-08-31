// d12_generics / ex5 - the new() constraint.
// See lessons/d12_generics/README.md, "Exercise 5".

namespace CSharpDojo.D12_Generics;

public class Pool<T>
    where T : class, new()
{
    private readonly Stack<T> _available = new Stack<T>();
    private readonly int _max;

    /// <summary>A maximum below 1 is an ArgumentOutOfRangeException.</summary>
    public Pool(int max)
    {
        throw new NotImplementedException("ex5: the Pool constructor is not implemented yet - edit this file.");
    }

    /// <summary>How many objects this pool has ever constructed.</summary>
    public int Created { get; private set; }

    /// <summary>How many are sitting in the pool right now, ready to be reused.</summary>
    public int Available =>
        throw new NotImplementedException("ex5: Available is not implemented yet - edit this file.");

    /// <summary>
    /// Hand one out: reuse a returned object if there is one, otherwise
    /// construct a new one. Constructing past the maximum is an
    /// InvalidOperationException.
    /// </summary>
    public T Rent()
    {
        throw new NotImplementedException("ex5: Rent is not implemented yet - edit this file.");
    }

    /// <summary>Put one back so the next Rent can reuse it.</summary>
    public void Return(T item)
    {
        throw new NotImplementedException("ex5: Return is not implemented yet - edit this file.");
    }
}
