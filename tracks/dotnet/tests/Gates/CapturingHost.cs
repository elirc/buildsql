// Harness, not content. src/Api booted with a LogCapture plugged into the
// logging pipeline, so a gate can read back what the application logged.
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Logging;

namespace DotnetDojo.Gates;

public sealed class CapturingHost : WebApplicationFactory<Program>
{
    public LogCapture Logs { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureLogging(logging =>
        {
            logging.SetMinimumLevel(LogLevel.Information);
            logging.AddProvider(Logs);
        });
    }
}
