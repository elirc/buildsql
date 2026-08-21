// 06_efcore_relationships - given code, not an exercise. Read it, do not edit it.
//
// Five entities and every relationship shape you meet in practice:
//   Customer 1--* Order 1--* OrderLine *--1 Product *--* Tag

using Microsoft.EntityFrameworkCore;

namespace DotnetDojo.Api.L06_EfcoreRelationships;

public class Customer
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    /// <summary>Collection navigation: the "many" side of one-to-many.</summary>
    public List<Order> Orders { get; set; } = [];
}

public class Order
{
    public int Id { get; set; }

    public string Reference { get; set; } = "";

    /// <summary>The foreign key. Naming it &lt;Navigation&gt;Id is what makes EF wire it up.</summary>
    public int CustomerId { get; set; }

    /// <summary>Reference navigation: the "one" side.</summary>
    public Customer? Customer { get; set; }

    public List<OrderLine> Lines { get; set; } = [];
}

public class OrderLine
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public Order? Order { get; set; }

    public int ProductId { get; set; }

    public Product? Product { get; set; }

    public int Quantity { get; set; }

    public int UnitPriceCents { get; set; }
}

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    /// <summary>Skip navigation: many-to-many with no join entity in your model.</summary>
    public List<Tag> Tags { get; set; } = [];
}

public class Tag
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public List<Product> Products { get; set; } = [];
}

public class OrdersDb(DbContextOptions<OrdersDb> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();

    public DbSet<Order> Orders => Set<Order>();

    public DbSet<OrderLine> OrderLines => Set<OrderLine>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<Tag> Tags => Set<Tag>();
}

public record OrderSummary(int Id, string Reference);

public record CustomerDetail(int Id, string Name, List<OrderSummary> Orders);

public record OrderTotals(int OrderId, string Customer, int LineCount, int TotalCents);

public record IdentityResult(bool SameInstance, string CustomerName);

public record CustomerSpend(int CustomerId, string Name, int TotalCents);

public record LineDetail(string ProductName, int Quantity, int LineTotalCents);

public class OrdersServices : IServiceRegistrar
{
    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        // The gates replace this with a private in-memory database, per test.
        services.AddDbContext<OrdersDb>(options => options.UseSqlite("Data Source=dojo-l06.db"));
    }
}
