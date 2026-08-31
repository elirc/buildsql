// d20_linq_joins_flatten / ex8 - flattening something that nests without limit.
// See lessons/d20_linq_joins_flatten/README.md, "Exercise 8".

namespace CSharpDojo.D20_LinqJoinsFlatten;

// The gate builds these. Written for you.
public record Category(string Name, List<Category> Children);

public static class Tree
{
    /// <summary>
    /// The full path to every node including the root, "root/tools/hammer",
    /// depth first, each parent immediately before its own subtree.
    /// </summary>
    public static List<string> Paths(Category root)
    {
        return Walk(root, string.Empty).ToList();
    }

    /// <summary>The names of the nodes with no children, in the same depth-first order.</summary>
    public static List<string> Leaves(Category root)
    {
        if (root.Children.Count == 0)
        {
            return new List<string> { root.Name };
        }

        return root.Children.SelectMany(child => Leaves(child)).ToList();
    }

    /// <summary>How many levels the tree has. A lone root is 1.</summary>
    public static int Depth(Category root)
    {
        if (root.Children.Count == 0)
        {
            return 1;
        }

        return 1 + root.Children.Max(child => Depth(child));
    }

    private static IEnumerable<string> Walk(Category node, string prefix)
    {
        string path = prefix.Length == 0 ? node.Name : $"{prefix}/{node.Name}";
        return new[] { path }.Concat(node.Children.SelectMany(child => Walk(child, path)));
    }
}
