// d14_sets_queues_stacks / ex8 - a postfix calculator on a stack.
// See lessons/d14_sets_queues_stacks/README.md, "Exercise 8".

namespace CSharpDojo.D14_SetsQueuesStacks;

public static class Postfix
{
    /// <summary>
    /// Evaluates a space-separated postfix (reverse Polish) expression over
    /// ints: "3 4 + 2 *" is (3 + 4) * 2 = 14. Operators are + - * /.
    /// An unknown token throws FormatException; an expression that pops an
    /// empty stack, or leaves more than one value behind, throws
    /// InvalidOperationException.
    /// </summary>
    public static int Evaluate(string expression)
    {
        Stack<int> stack = new Stack<int>();

        foreach (string token in expression.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            if (token is "+" or "-" or "*" or "/")
            {
                int right = stack.Pop();   // Pop on empty already throws InvalidOperationException.
                int left = stack.Pop();
                stack.Push(token switch
                {
                    "+" => left + right,
                    "-" => left - right,
                    "*" => left * right,
                    _ => left / right,
                });
            }
            else if (int.TryParse(token, out int number))
            {
                stack.Push(number);
            }
            else
            {
                throw new FormatException($"unknown token: {token}");
            }
        }

        if (stack.Count != 1)
        {
            throw new InvalidOperationException($"expression left {stack.Count} values on the stack");
        }

        return stack.Pop();
    }
}
