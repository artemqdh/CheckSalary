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
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Postgres"),
        x => x.UseNetTopologySuite())); // PostGIS

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<SalarySubmittedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
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

// Redis
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("submit-policy", config =>
    {
        config.PermitLimit = 5;              // 5 requests
        config.Window = TimeSpan.FromMinutes(1); // per 1 minute
        config.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        config.QueueLimit = 0;               // no queueing, just reject
    });

    options.RejectionStatusCode = 429;       // when too many requests
});

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Postgres")!)
    .AddRedis("localhost:6379")
    .AddCheck("redis_circuit", () =>
    {
        if (RedisCacheService.IsCircuitOpen)
            return HealthCheckResult.Degraded("Redis circuit is OPEN � using fallback");
        return HealthCheckResult.Healthy("Redis circuit closed � normal operation");
    });

builder.Services.AddScoped<ISalaryRepository, SalaryRepository>();
builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddScoped<IGeoSearchService, PostgisGeoService>();

builder.Services.AddHttpClient<IStackNormalizer, OllamaStackNormalizer>(client =>
{
    client.BaseAddress = new Uri("http://localhost:11434");
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

app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
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

// Make Program accessible to integration tests
public partial class Program { }