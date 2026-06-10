using CheckSalary.Domain.Modules.SearchDiscovery.Interfaces;
using CheckSalary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CheckSalary.Infrastructure.GIS;

public class PostgisGeoService : IGeoSearchService
{
    private readonly AppDbContext _context;

    public PostgisGeoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<GeoSearchResult>> SearchWithinRadiusAsync(
        double latitude,
        double longitude,
        double radiusKm,
        string? stack = null,
        CancellationToken cancellationToken = default)
    {
        var sql = @"
    SELECT 
        ""City"",
        ""Stack"",
        ""Level"",
        AVG(""Amount"") AS ""AverageSalary"",
        COUNT(*) AS ""SampleSize"",
        MIN(""DistanceKm"") AS ""DistanceKm"",
        AVG(""Latitude"") AS ""Latitude"",
        AVG(""Longitude"") AS ""Longitude""
    FROM (
        SELECT 
            ""City"",
            COALESCE(""StackNormalized"", ""StackRaw"") AS ""Stack"",
            ""Level"",
            ""Amount"",
            ""Latitude"",
            ""Longitude"",
            ST_Distance(
                ""Location"",
                ST_SetSRID(ST_MakePoint(@lng, @lat), 4326)::geography
            ) / 1000.0 AS ""DistanceKm""
        FROM ""SalaryEntries""
        WHERE ST_DWithin(
            ""Location"",
            ST_SetSRID(ST_MakePoint(@lng, @lat), 4326)::geography,
            @radiusMeters
        )";

        if (!string.IsNullOrWhiteSpace(stack))
        {
            sql += @" AND (""StackNormalized"" = @stack OR ""StackRaw"" = @stack)";
        }

        sql += @"
    ) AS subquery 
    GROUP BY ""City"", ""Stack"", ""Level""";

        var parameters = new List<Npgsql.NpgsqlParameter>
        {
            new("lat", latitude),
            new("lng", longitude),
            new("radiusMeters", radiusKm * 1000)
        };

        if (!string.IsNullOrWhiteSpace(stack))
        {
            parameters.Add(new Npgsql.NpgsqlParameter("stack", stack));
        }

        var results = await _context.Database
            .SqlQueryRaw<GeoSearchRaw>(sql, parameters.ToArray())
            .ToListAsync(cancellationToken);

        return results.Select(r => new GeoSearchResult(
            r.City,
            r.Stack,
            r.Level,
            r.AverageSalary,
            r.SampleSize,
            r.DistanceKm,
            r.Latitude,
            r.Longitude
        )).ToList();
    }

    private class GeoSearchRaw
    {
        public string City { get; set; } = string.Empty;
        public string Stack { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public decimal AverageSalary { get; set; }
        public int SampleSize { get; set; }
        public double DistanceKm { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}