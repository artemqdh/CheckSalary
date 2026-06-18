using CheckSalary.Application.Modules.Analytics.Caching;
using CheckSalary.Application.Modules.SalarySubmission.Services;
using CheckSalary.Domain.Modules.Analytics.Interfaces;
using CheckSalary.Domain.Modules.SearchDiscovery.Interfaces;
using CheckSalary.Infrastructure.AI;
using CheckSalary.Infrastructure.Caching;
using CheckSalary.Infrastructure.GIS;
using CheckSalary.Infrastructure.Messaging;
using CheckSalary.Infrastructure.Persistence;
using MassTransit;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Postgres") ?? "Host=localhost;Database=checksalary;Username=admin;Password=password123",
        x => x.UseNetTopologySuite()));

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<SalarySubmittedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitConnection = builder.Configuration.GetConnectionString("RabbitMQ") ?? "rabbitmq://localhost";
        cfg.Host(new Uri(rabbitConnection), "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
        cfg.ReceiveEndpoint("salary-submitted-queue", e =>
                {
                    e.ConfigureConsumer<SalarySubmittedConsumer>(context);
                });
    });
});

var jaegerEndpoint = builder.Configuration["Jaeger:Endpoint"] ?? "http://localhost:4317";
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t
        .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("CheckSalary"))
        .AddAspNetCoreInstrumentation()
        .AddSource("MassTransit")
        .AddOtlpExporter(o => o.Endpoint = new Uri(jaegerEndpoint)));

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("submit-policy", config =>
    {
        config.PermitLimit = 5;
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        config.QueueLimit = 0;
    });
    options.RejectionStatusCode = 429;
});

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Postgres")!)
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!)
    .AddCheck("redis_circuit", () =>
    {
        if (RedisCacheService.IsCircuitOpen)
            return HealthCheckResult.Degraded("Redis circuit is OPEN - using fallback");
        return HealthCheckResult.Healthy("Redis circuit closed - normal operation");
    });

builder.Services.AddScoped<ISalaryRepository, SalaryRepository>();
builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddScoped<IGeoSearchService, PostgisGeoService>();

var ollamaUrl = builder.Configuration["Ollama:BaseUrl"] ?? "http://localhost:11434";
builder.Services.AddHttpClient<IStackNormalizer, OllamaStackNormalizer>(client =>
{
    client.BaseAddress = new Uri(ollamaUrl);
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.UseHttpsRedirection();
app.UseRateLimiter();
app.MapControllers();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    AllowCachingResponses = false,
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = System.Text.Json.JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            components = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description
            })
        });
        await context.Response.WriteAsync(result);
    }
});

app.Run();

public partial class Program { }