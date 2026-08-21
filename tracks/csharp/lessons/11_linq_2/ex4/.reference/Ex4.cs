// 11_linq_2 / ex4 - Aggregate, and the same query written the other way round.
// See lessons/11_linq_2/README.md, "Exercise 4".

namespace CSharpDojo.L11_Linq2;

public static class Folding
{
    /// <summary>
    /// The longest word, using Aggregate rather than a loop. On a tie the
    /// earlier word wins. An empty sequence has no longest word - let Aggregate
    /// throw rather than inventing one.
    /// </summary>
    public static string Longest(IEnumerable<string> words)
    {
        return words.Aggregate((best, word) => word.Length > best.Length ? word : best);
    }

    /// <summary>
    /// "city: count" for each city, most customers first, ties broken by city
    /// A-Z. Write this one in QUERY syntax (from / group / into / select) - the
    /// gate cannot tell, but you are here to learn both.
    /// </summary>
    public static List<string> CitiesByCustomerCount(IEnumerable<Customer> customers)
    {
        return (from customer in customers
                group customer by customer.City into city
                orderby city.Count() descending, city.Key
                select $"{city.Key}: {city.Count()}").ToList();
    }
}
