// 11_linq_2 - the shared data model. You never edit this file; the gate builds
// the sample rows and hands them to the methods you write.

namespace CSharpDojo.L11_Linq2;

/// <summary>The "customers table".</summary>
public record Customer(int Id, string Name, string City);

/// <summary>The "sales table". CustomerId is the foreign key.</summary>
public record Sale(int Id, int CustomerId, string Category, decimal Amount);

/// <summary>A row that holds a collection - the thing SelectMany flattens.</summary>
public record Shipment(string Code, List<string> Items);
