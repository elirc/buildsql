// Harness, not content. Proves the ASP.NET Core plumbing itself works, so a
// failing lesson gate is never ambiguous between "my code is wrong" and "the
// scaffold is broken". Deliberately named without a lesson prefix so no
// `--filter FullyQualifiedName~L01_` ever picks it up.
using System.Net;

namespace DotnetDojo.Gates;

public class HarnessSmokeTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task TheApiBootsAndAnswersHealth()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        await Teach.Status(
            HttpStatusCode.OK,
            response,
            "src/Api failed to boot. This is a scaffold problem, not your code: "
                + "run `uv run dojo doctor` and check the build output.");
    }
}
