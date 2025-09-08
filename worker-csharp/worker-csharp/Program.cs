
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseKestrel(options =>
{
    options.ListenAnyIP(6003);
});

var app = builder.Build();
app.UseCors(x => x.AllowAnyOrigin());

app.MapPost("/compute", async (HttpContext ctx) =>
{
    // Deserialize the request body to a FractalRequest record
    var req = await JsonSerializer.DeserializeAsync<FractalRequest>(ctx.Request.Body);

    // Compute a dummy image based on the request
    var pixels = worker_csharp.ComputeFractal.ComputeJulia(req);

    // Build the response record
    var resp = new FractalResponse(req.Width, req.Height, pixels);

    // Return JSON
    ctx.Response.ContentType = "application/json";
    await JsonSerializer.SerializeAsync(ctx.Response.Body, resp);
});

app.Run();

// ---------------------------------------------------------------------
// Data contracts
// ---------------------------------------------------------------------
public record FractalRequest(string Method, int Width, int Height, double CenterX, double CenterY, double Zoom);
record FractalResponse(int Width, int Height, int[] Data);

