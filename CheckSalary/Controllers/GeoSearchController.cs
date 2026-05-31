using CheckSalary.Domain.Modules.SearchDiscovery.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CheckSalary.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeoSearchController : ControllerBase
{
    private readonly IGeoSearchService _geoSearch;

    public GeoSearchController(IGeoSearchService geoSearch)
    {
        _geoSearch = geoSearch;
    }

    [HttpGet("radius")]
    public async Task<IActionResult> SearchRadius(
        [FromQuery] double lat,
        [FromQuery] double lng,
        [FromQuery] double radiusKm = 50,
        [FromQuery] string? stack = null)
    {
        var results = await _geoSearch.SearchWithinRadiusAsync(lat, lng, radiusKm, stack);

        if (results.Count == 0)
            return NotFound(new { message = "No salary data found in this area" });

        return Ok(new
        {
            center = new { lat, lng },
            radiusKm,
            stack,
            results
        });
    }
}