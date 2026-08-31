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
        throw new NotImplementedException("ex8: Paths is not implemented yet - edit this file.");
    }

    /// <summary>The names of the nodes with no children, in the same depth-first order.</summary>
    public static List<string> Leaves(Category root)
    {
        throw new NotImplementedException("ex8: Leaves is not implemented yet - edit this file.");
    }

    /// <summary>How many levels the tree has. A lone root is 1.</summary>
    public static int Depth(Category root)
    {
        throw new NotImplementedException("ex8: Depth is not implemented yet - edit this file.");
    }
}
