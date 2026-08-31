// d05_classes_construction / ex8 - a fluent builder.
// See lessons/d05_classes_construction/README.md, "Exercise 8".

using System.Text;

namespace CSharpDojo.D05_ClassesConstruction;

public class UrlBuilder
{
    private readonly List<string> _segments = new List<string>();
    private readonly List<KeyValuePair<string, string>> _query = new List<KeyValuePair<string, string>>();
    private string? _host;

    /// <summary>
    /// Set the host. A blank host is an ArgumentException. Returns THIS
    /// builder so calls can be chained.
    /// </summary>
    public UrlBuilder Host(string host)
    {
        if (string.IsNullOrWhiteSpace(host))
        {
            throw new ArgumentException("A URL needs a host.", nameof(host));
        }

        _host = host.Trim();
        return this;
    }

    /// <summary>
    /// Append one path segment, with any "/" trimmed from its ends. A blank
    /// segment is an ArgumentException. Returns this builder.
    /// </summary>
    public UrlBuilder Path(string segment)
    {
        if (string.IsNullOrWhiteSpace(segment))
        {
            throw new ArgumentException("A path segment needs content.", nameof(segment));
        }

        _segments.Add(segment.Trim().Trim('/'));
        return this;
    }

    /// <summary>
    /// Add a query parameter. A blank key is an ArgumentException. A key given
    /// twice keeps its ORIGINAL position with the newer value. Returns this
    /// builder.
    /// </summary>
    public UrlBuilder Query(string key, string value)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new ArgumentException("A query parameter needs a key.", nameof(key));
        }

        string trimmed = key.Trim();
        for (int i = 0; i < _query.Count; i++)
        {
            if (_query[i].Key == trimmed)
            {
                _query[i] = new KeyValuePair<string, string>(trimmed, value);
                return this;
            }
        }

        _query.Add(new KeyValuePair<string, string>(trimmed, value));
        return this;
    }

    /// <summary>
    /// "https://host", then "/segment" for each segment in order, then
    /// "?key=value&amp;key=value" when there are any parameters.
    /// Building without a host is an InvalidOperationException - a caller
    /// error about the object's STATE rather than about an argument.
    /// </summary>
    public string Build()
    {
        if (_host is null)
        {
            throw new InvalidOperationException("Set a host before building the URL.");
        }

        StringBuilder url = new StringBuilder("https://").Append(_host);
        foreach (string segment in _segments)
        {
            url.Append('/').Append(segment);
        }

        for (int i = 0; i < _query.Count; i++)
        {
            url.Append(i == 0 ? '?' : '&').Append(_query[i].Key).Append('=').Append(_query[i].Value);
        }

        return url.ToString();
    }
}
