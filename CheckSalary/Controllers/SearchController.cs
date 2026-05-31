using CheckSalary.Application.Modules.Analytics.Caching;
using CheckSalary.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CheckSalary.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly ICacheService _cache;
    private readonly AppDbContext _context;

    public SearchController(ICacheService cache, AppDbContext context)
    {
        _cache = cache;
        _context = context;
    }

    [HttpGet("average")]
    public async Task<IActionResult> GetAverage([FromQuery] string city, [FromQuery] string stack)
    {
        var average = await _cache.GetCachedAverageAsync(city, stack);

        if (average is null)
            return NotFound(new { message = "No data for this city and stack" });

        return Ok(new { city, stack, averageSalary = average });
    }

    [HttpGet("cities")]
    public async Task<IActionResult> AutocompleteCity([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(Array.Empty<object>());

        var sql = @"
            SELECT DISTINCT ""City""
            FROM ""SalaryEntries""
            WHERE LOWER(""City"") LIKE LOWER(@query)
            ORDER BY ""City""
            LIMIT 10";

        var parameters = new Npgsql.NpgsqlParameter[]
        {
            new("query", $"%{q}%")
        };

        var cities = await _context.Database
            .SqlQueryRaw<string>(sql, parameters)
            .ToListAsync();

        return Ok(cities);
    }
}