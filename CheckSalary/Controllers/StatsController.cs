using CheckSalary.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckSalary.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StatsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview([FromQuery] string? level = null, [FromQuery] string? stack = null)
    {
        var query = _context.SalaryEntries.AsQueryable();
    
        if (!string.IsNullOrWhiteSpace(level) && level != "All")
            query = query.Where(e => e.Level == level);
    
        if (!string.IsNullOrWhiteSpace(stack) && stack != "All")
            query = query.Where(e => (e.StackNormalized ?? e.StackRaw) == stack);

        var totalSubmissions = await query.CountAsync();
        var uniqueCities = await query.Select(e => e.City).Distinct().CountAsync();
        var uniqueStacks = await query
            .Select(e => e.StackNormalized ?? e.StackRaw).Distinct().CountAsync();

        return Ok(new { totalSubmissions, uniqueCities, uniqueStacks });
    }

    [HttpGet("top-cities")]
    public async Task<IActionResult> GetTopCities([FromQuery] string? stack = null, [FromQuery] string? level = null)
    {
        var query = _context.SalaryEntries.AsQueryable();

        if (!string.IsNullOrWhiteSpace(stack))
            query = query.Where(e => (e.StackNormalized ?? e.StackRaw) == stack);
    
        if (!string.IsNullOrWhiteSpace(level) && level != "All")
            query = query.Where(e => e.Level == level);

        var cities = await query
            .GroupBy(e => e.City)
            .Select(g => new { city = g.Key, averageSalary = Math.Round(g.Average(e => e.Amount), 0), sampleSize = g.Count() })
            .OrderByDescending(c => c.averageSalary)
            .Take(10)
            .ToListAsync();

        return Ok(cities);
    }

    [HttpGet("top-stacks")]
    public async Task<IActionResult> GetTopStacks([FromQuery] string? level = null, [FromQuery] string? stack = null)
    {
        var query = _context.SalaryEntries.AsQueryable();
    
        if (!string.IsNullOrWhiteSpace(level) && level != "All")
            query = query.Where(e => e.Level == level);
    
        if (!string.IsNullOrWhiteSpace(stack) && stack != "All")
            query = query.Where(e => (e.StackNormalized ?? e.StackRaw) == stack);

        var stacks = await query
            .GroupBy(e => e.StackNormalized ?? e.StackRaw)
            .Select(g => new { stack = g.Key, averageSalary = Math.Round(g.Average(e => e.Amount), 0), sampleSize = g.Count() })
            .OrderByDescending(s => s.averageSalary)
            .Take(8)
            .ToListAsync();

        return Ok(stacks);
    }
}