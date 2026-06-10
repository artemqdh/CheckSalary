namespace CheckSalary.Domain.Modules.SearchDiscovery.Interfaces
{
    public interface IGeoSearchService
    {
        Task<List<GeoSearchResult>> SearchWithinRadiusAsync(
            double latitude,
            double longitude,
            double radiusKm,
            string? stack = null,
            CancellationToken cancellationToken = default);
    }

    public record GeoSearchResult(
        string City,
        string Stack,
        string Level,
        decimal AverageSalary,
        int SampleSize,
        double DistanceKm,
        double Latitude,
        double Longitude
    );
}