using CheckSalary.Application.Modules.Analytics.Caching;
using Microsoft.Extensions.Caching.Distributed;
using Polly;
using Polly.CircuitBreaker;

namespace CheckSalary.Infrastructure.Caching;

public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private static readonly AsyncCircuitBreakerPolicy _circuitBreaker;
    
    public static bool IsCircuitOpen => _circuitBreaker.CircuitState == CircuitState.Open;

    static RedisCacheService()
    {
        _circuitBreaker = Policy
            .Handle<Exception>()
            .CircuitBreakerAsync(
                exceptionsAllowedBeforeBreaking: 3,
                durationOfBreak: TimeSpan.FromSeconds(30),
                onBreak: (ex, ts) =>
                {
                    Console.WriteLine($"🔴 Redis circuit BREAKING for {ts.TotalSeconds}s — {ex.Message}");
                },
                onReset: () =>
                {
                    Console.WriteLine("🟢 Redis circuit RESET — connection restored");
                },
                onHalfOpen: () =>
                {
                    Console.WriteLine("🟡 Redis circuit HALF-OPEN — testing connection");
                });
    }

    public RedisCacheService(IDistributedCache cache)
    {
        _cache = cache;
    }

    private static string GetKey(string city, string stack) => $"avg:{city}:{stack}";

    public async Task<decimal?> GetCachedAverageAsync(string city, string stack)
    {
        try
        {
            return await _circuitBreaker.ExecuteAsync(async () =>
            {
                var value = await _cache.GetStringAsync(GetKey(city, stack));
                return value is null ? (decimal?)null : decimal.Parse(value);
            });
        }
        catch (BrokenCircuitException)
        {
            Console.WriteLine("⚠️ Redis circuit open — returning null (cache unavailable)");
            return null;
        }
        catch
        {
            return null;
        }
    }

    public async Task SetCachedAverageAsync(string city, string stack, decimal average)
    {
        try
        {
            await _circuitBreaker.ExecuteAsync(async () =>
            {
                var options = new DistributedCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromHours(1)
                };
                await _cache.SetStringAsync(GetKey(city, stack), average.ToString(), options);
            });
        }
        catch (BrokenCircuitException)
        {
            Console.WriteLine("⚠️ Redis circuit open — cache write skipped (will retry later)");
        }
        catch
        {
            
        }
    }

    public async Task InvalidateAsync(string city, string stack)
    {
        try
        {
            await _circuitBreaker.ExecuteAsync(async () =>
            {
                await _cache.RemoveAsync(GetKey(city, stack));
            });
        }
        catch (BrokenCircuitException)
        {
            // Circuit open
        }
        catch
        {
            
        }
    }
}