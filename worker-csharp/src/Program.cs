using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/compute", async (HttpContext ctx) =>
{
    var req = await JsonSerializer.DeserializeAsync<FractalRequest>(ctx.Request.Body);
    var pixels = ComputeDummy(req);
    var resp = new FractalResponse
    {
        Width = req.Width,
        Height = req.Height,
        Data = pixels
    };
    ctx.Response.ContentType = "application/json";
    await JsonSerializer.SerializeAsync(ctx.Response.Body, resp);
});

app.Run();

record FractalRequest(string Method, int Width, int Height, double CenterX, double CenterY, double Zoom);
record FractalResponse(int Width, int Height, int[] Data);

int[] ComputeDummy(FractalRequest req)
{
    var pixels = new int[req.Width * req.Height * 4];
    for (int y = 0; y < req.Height; y++)
    {
        for (int x = 0; x < req.Width; x++)
        {
            int idx = 4 * (y * req.Width + x);
            var gray = (byte)((x + y) % 256);
            pixels[idx] = gray;     // R
            pixels[idx + 1] = gray; // G
            pixels[idx + 2] = gray; // B
            pixels[idx + 3] = 255;  // A
        }
    }
    return pixels;
}