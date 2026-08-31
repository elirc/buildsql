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
        if (max < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(max), "A pool holds at least one object.");
        }

        _max = max;
    }

    /// <summary>How many objects this pool has ever constructed.</summary>
    public int Created { get; private set; }

    /// <summary>How many are sitting in the pool right now, ready to be reused.</summary>
    public int Available => _available.Count;

    /// <summary>
    /// Hand one out: reuse a returned object if there is one, otherwise
    /// construct a new one. Constructing past the maximum is an
    /// InvalidOperationException.
    /// </summary>
    public T Rent()
    {
        if (_available.Count > 0)
        {
            return _available.Pop();
        }

        if (Created >= _max)
        {
            throw new InvalidOperationException("The pool is exhausted.");
        }

        Created++;
        return new T();
    }

    /// <summary>Put one back so the next Rent can reuse it.</summary>
    public void Return(T item)
    {
        _available.Push(item);
    }
}
