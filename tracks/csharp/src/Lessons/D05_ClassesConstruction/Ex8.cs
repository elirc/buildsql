// d05_classes_construction / ex8 - a fluent builder.
// See lessons/d05_classes_construction/README.md, "Exercise 8".

namespace CSharpDojo.D05_ClassesConstruction;

public class UrlBuilder
{
    /// <summary>
    /// Set the host. A blank host is an ArgumentException. Returns THIS
    /// builder so calls can be chained.
    /// </summary>
    public UrlBuilder Host(string host)
    {
        throw new NotImplementedException("ex8: Host is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Append one path segment, with any "/" trimmed from its ends. A blank
    /// segment is an ArgumentException. Returns this builder.
    /// </summary>
    public UrlBuilder Path(string segment)
    {
        throw new NotImplementedException("ex8: Path is not implemented yet - edit this file.");
    }

    /// <summary>
    /// Add a query parameter. A blank key is an ArgumentException. A key given
    /// twice keeps its ORIGINAL position with the newer value. Returns this
    /// builder.
    /// </summary>
    public UrlBuilder Query(string key, string value)
    {
        throw new NotImplementedException("ex8: Query is not implemented yet - edit this file.");
    }

    /// <summary>
    /// "https://host", then "/segment" for each segment in order, then
    /// "?key=value&amp;key=value" when there are any parameters.
    /// Building without a host is an InvalidOperationException - a caller
    /// error about the object's STATE rather than about an argument.
    /// </summary>
    public string Build()
    {
        throw new NotImplementedException("ex8: Build is not implemented yet - edit this file.");
    }
}
