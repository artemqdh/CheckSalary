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
    public async Task<IActionResult> GetOverview()
    {
        var totalSubmissions = await _context.SalaryEntries.CountAsync();
        var uniqueCities = await _context.SalaryEntries.Select(e => e.City).Distinct().CountAsync();
        var uniqueStacks = await _context.SalaryEntries
            .Select(e => e.StackNormalized ?? e.StackRaw).Distinct().CountAsync();

        return Ok(new
        {
            totalSubmissions,
            uniqueCities,
            uniqueStacks
        });
    }

    [HttpGet("top-cities")]
    public async Task<IActionResult> GetTopCities([FromQuery] string? stack = null)
    {
        var query = _context.SalaryEntries.AsQueryable();

        if (!string.IsNullOrWhiteSpace(stack))
        {
            query = query.Where(e => (e.StackNormalized ?? e.StackRaw) == stack);
        }

        var cities = await query
            .GroupBy(e => e.City)
            .Select(g => new
            {
                city = g.Key,
                averageSalary = Math.Round(g.Average(e => e.Amount), 0),
                sampleSize = g.Count()
            })
            .OrderByDescending(c => c.averageSalary)
            .Take(10)
            .ToListAsync();

        return Ok(cities);
    }

    [HttpGet("top-stacks")]
    public async Task<IActionResult> GetTopStacks()
    {
        var stacks = await _context.SalaryEntries
            .GroupBy(e => e.StackNormalized ?? e.StackRaw)
            .Select(g => new
            {
                stack = g.Key,
                averageSalary = Math.Round(g.Average(e => e.Amount), 0),
                sampleSize = g.Count()
            })
            .OrderByDescending(s => s.averageSalary)
            .Take(8)
            .ToListAsync();

        return Ok(stacks);
    }
}