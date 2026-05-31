using CheckSalary.Application.Modules.Analytics.Caching;
using CheckSalary.Domain.Modules.Analytics.Entities;
using CheckSalary.Domain.Modules.SalarySubmission.Events;
using CheckSalary.Infrastructure.Persistence;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace CheckSalary.Infrastructure.Messaging;

public class SalarySubmittedConsumer : IConsumer<SalarySubmittedEvent>
{
    private readonly AppDbContext _context;
    private readonly ICacheService _cache;

    public SalarySubmittedConsumer(AppDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task Consume(ConsumeContext<SalarySubmittedEvent> context)
    {
        var message = context.Message;

        // Get all entries for this city + stack
        var salaries = await _context.SalaryEntries
            .Where(e => e.City == message.City && e.StackRaw == message.StackRaw)
            .ToListAsync();

        if (salaries.Count == 0) return;

        var average = salaries.Average(s => s.Amount);

        // Find existing CityAverage or create new
        var cityAverage = await _context.CityAverages.FirstOrDefaultAsync(ca => ca.City == message.City && ca.Stack == message.StackRaw);

        if (cityAverage is null)
        {
            cityAverage = new CityAverage(message.City, message.StackRaw, average, salaries.Count);
            _context.CityAverages.Add(cityAverage);
        }
        else
        {
            cityAverage.UpdateAverage(average, salaries.Count);
        }

        await _context.SaveChangesAsync();
        await _cache.SetCachedAverageAsync(message.City, message.StackRaw, average);

        Console.WriteLine($"Updated average for {message.StackRaw} in {message.City}: {average:C} ({salaries.Count} samples)");
    }
}