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

        var cities = await _context.Cities
            .Where(c => EF.Functions.ILike(c.Name, $"%{q}%"))
            .OrderBy(c => c.Name)
            .Take(10)
            .Select(c => new
            {
                c.Name,
                c.Latitude,
                c.Longitude
            })
            .ToListAsync();

        return Ok(cities);
    }
}