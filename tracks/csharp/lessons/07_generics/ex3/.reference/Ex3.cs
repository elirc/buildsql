// 07_generics / ex3 - a generic type of your own.
// See lessons/07_generics/README.md, "Exercise 3".

namespace CSharpDojo.L07_Generics;

/// <summary>
/// Either a value or an explanation of why there isn't one. The point of making
/// it generic: Result&lt;int&gt; and Result&lt;Order&gt; share one implementation
/// and neither one loses its type.
/// </summary>
public class Result<T>
{
    private readonly T _value;
    private readonly string _error;

    private Result(bool isOk, T value, string error)
    {
        IsOk = isOk;
        _value = value;
        _error = error;
    }

    public bool IsOk { get; }

    /// <summary>The value. Asking a failed Result for one is InvalidOperationException.</summary>
    public T Value
    {
        get
        {
            if (!IsOk)
            {
                throw new InvalidOperationException($"This result failed: {_error}");
            }

            return _value;
        }
    }

    /// <summary>The explanation, or "" when there is nothing to explain.</summary>
    public string Error => _error;

    /// <summary>A successful result carrying a value.</summary>
    public static Result<T> Ok(T value)
    {
        return new Result<T>(true, value, "");
    }

    /// <summary>A failed result carrying a reason.</summary>
    public static Result<T> Fail(string error)
    {
        return new Result<T>(false, default!, error);
    }
}
