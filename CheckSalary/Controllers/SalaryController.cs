using CheckSalary.Application.Modules.SalarySubmission.DTOs;
using CheckSalary.Application.Modules.SalarySubmission.Services;
using CheckSalary.Domain.Modules.Analytics.Interfaces;
using CheckSalary.Domain.Modules.SalarySubmission.Entities;
using CheckSalary.Domain.Modules.SalarySubmission.Events;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CheckSalary.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalaryController : ControllerBase
{
    private readonly ISalaryRepository _repository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly IStackNormalizer _normalizer;

    public SalaryController(ISalaryRepository repository, IPublishEndpoint publishEndpoint, IStackNormalizer normalizer)
    {
        _repository = repository;
        _publishEndpoint = publishEndpoint;
        _normalizer = normalizer;
    }

    [HttpPost]
    [EnableRateLimiting("submit-policy")]
    public async Task<IActionResult> Submit([FromBody] SubmitSalaryRequest request)
    {
        // Normalize the stack name using Ollama AI
        var normalized = await _normalizer.NormalizeAsync(request.Stack);
        Console.WriteLine($"Raw: {request.Stack} → Normalized: {normalized.Normalized}, Confidence: {normalized.Confidence}");

        var entry = new SalaryEntry(
            request.Stack,
            request.Amount,
            request.City,
            request.Latitude,
            request.Longitude);

        entry.SetNormalizedStack(normalized.Normalized);

        await _repository.AddAsync(entry);
        await _repository.SaveChangesAsync();

        // Publish event
        await _publishEndpoint.Publish(new SalarySubmittedEvent(
            entry.Id,
            entry.StackRaw,
            entry.Amount,
            entry.City,
            entry.CreatedAt));

        return Ok(new
        {
            id = entry.Id,
            raw = entry.StackRaw,
            normalized = normalized.Normalized,
            confidence = normalized.Confidence
        });
    }
    
    [HttpPost("normalize")]
    public async Task<IActionResult> Normalize([FromBody] NormalizeRequest request)
    {
        var result = await _normalizer.NormalizeAsync(request.Stack);
        return Ok(new { normalized = result.Normalized, confidence = result.Confidence });
    }

    public record NormalizeRequest(string Stack);
}