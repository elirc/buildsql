// Harness, not content. Boots src/Api in-process for the W (API) gate family.
//
// A lesson's gate class does:
//
//     public class L01_RoutingTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
//     {
//         [Fact]
//         public async Task Ex1_ReturnsTheOrder()
//         {
//             using var client = factory.CreateClient();
//             var response = await client.GetAsync("/orders/1");
//             await Teach.Status(HttpStatusCode.OK, response, "...");
//         }
//     }
//
// No sockets are opened: WebApplicationFactory wires an in-memory transport
// straight into the same pipeline `dotnet run` would build.
using Microsoft.AspNetCore.Mvc.Testing;

namespace DotnetDojo.Gates;

public class DojoWebFactory : WebApplicationFactory<Program>
{
}
