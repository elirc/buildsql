// The one composition root for the whole .NET track.
//
// You (the learner) almost never edit this file. Each lesson adds a folder
// under src/Api/ - L01_Routing/, L02_DependencyInjection/, ... - containing a
// class that implements IEndpointMapper (and optionally IServiceRegistrar).
// LessonModules finds them by reflection and wires them up, so a lesson's
// endpoints exist the moment you write them, and one lesson's mistakes cannot
// unregister another lesson's routes.
//
// See AUTHORING.md for the full convention.
using DotnetDojo.Api;

var builder = WebApplication.CreateBuilder(args);

LessonModules.RegisterServices(builder.Services, builder.Configuration);

var app = builder.Build();

// Harness endpoint, not a lesson: proves the app boots at all.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

LessonModules.MapEndpoints(app);

app.Run();

// WebApplicationFactory<Program> in tests/Gates needs a public entry-point type.
public partial class Program;
