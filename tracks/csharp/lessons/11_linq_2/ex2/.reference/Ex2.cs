// 11_linq_2 / ex2 - Join and GroupJoin: INNER JOIN and LEFT JOIN.
// See lessons/11_linq_2/README.md, "Exercise 2".

namespace CSharpDojo.L11_Linq2;

public static class Joins
{
    /// <summary>
    /// "customer - category" for every sale, matched to its customer by
    /// CustomerId, in sale-id order. A sale whose customer is missing does not
    /// appear at all.
    /// </summary>
    public static List<string> SaleLabels(IEnumerable<Customer> customers, IEnumerable<Sale> sales)
    {
        return sales
            .Join(
                customers,
                sale => sale.CustomerId,
                customer => customer.Id,
                (sale, customer) => new { sale.Id, Label = $"{customer.Name} - {sale.Category}" })
            .OrderBy(row => row.Id)
            .Select(row => row.Label)
            .ToList();
    }

    /// <summary>
    /// "name: count" for EVERY customer, name A-Z - including the ones with no
    /// sales at all, which report 0.
    /// </summary>
    public static List<string> SaleCounts(IEnumerable<Customer> customers, IEnumerable<Sale> sales)
    {
        return customers
            .GroupJoin(
                sales,
                customer => customer.Id,
                sale => sale.CustomerId,
                (customer, theirSales) => new { customer.Name, Count = theirSales.Count() })
            .OrderBy(row => row.Name)
            .Select(row => $"{row.Name}: {row.Count}")
            .ToList();
    }
}
