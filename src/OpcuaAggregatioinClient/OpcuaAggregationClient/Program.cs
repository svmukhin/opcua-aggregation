var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.MapGet("/", () => "Opc UA Aggregation Client");
app.MapControllers();

await app.RunAsync();
