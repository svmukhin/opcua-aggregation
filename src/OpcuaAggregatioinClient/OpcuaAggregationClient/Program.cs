using OpcuaAggregationClient.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMemoryCache();

builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll",
        builder => {
            builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowAll");

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.MapGet("/", () => "Opc UA Aggregation Client");
app.MapControllers();

await app.RunAsync();
