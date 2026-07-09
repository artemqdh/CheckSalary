namespace CheckSalary.Application.Modules.Analytics.Caching;

public interface ICacheService
{
    Task<decimal?> GetCachedAverageAsync(string city, string stack);
    Task SetCachedAverageAsync(string city, string stack, decimal average);
}