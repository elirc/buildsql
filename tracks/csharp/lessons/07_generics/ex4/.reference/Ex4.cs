// 07_generics / ex4 - variance: which way a generic interface may be converted.
// See lessons/07_generics/README.md, "Exercise 4".
//
// Both interfaces below need a variance annotation on their type parameter
// before the two one-line methods at the bottom will compile.

namespace CSharpDojo.L07_Generics;

/// <summary>Only ever hands a T OUT.</summary>
public interface IProducer<out T>
{
    T Produce();
}

/// <summary>Only ever takes a T IN.</summary>
public interface IConsumer<in T>
{
    string Consume(T item);
}

public class GreetingProducer : IProducer<string>
{
    public string Produce() => "hello";
}

public class AnythingConsumer : IConsumer<object>
{
    public string Consume(object item) => $"consumed {item}";
}

public static class Variance
{
    /// <summary>
    /// A producer of strings IS a producer of objects - every string it hands
    /// back is an object. Return the argument unchanged.
    /// </summary>
    public static IProducer<object> Widen(IProducer<string> producer) => producer;

    /// <summary>
    /// A consumer of objects can be used wherever a consumer of strings is
    /// wanted - it accepts anything, so it accepts strings. Return the argument.
    /// </summary>
    public static IConsumer<string> Narrow(IConsumer<object> consumer) => consumer;
}
