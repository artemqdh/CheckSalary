using CheckSalary.Application.Modules.Analytics.Caching;
using CheckSalary.Domain.Modules.SalarySubmission.Entities;
using CheckSalary.Domain.Modules.SalarySubmission.Events;
using CheckSalary.Infrastructure.Messaging;
using CheckSalary.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using Moq;

namespace CheckSalary.Tests;

public class AnalyticsConsumerTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task Consume_FirstSalary_CreatesCityAverage()
    {
        // Arrange
        var context = CreateContext();
        var cacheMock = new Mock<ICacheService>();
        var consumer = new SalarySubmittedConsumer(context, cacheMock.Object);

        var salaryEntry = new SalaryEntry("C#", 100000, "Berlin", 52.52, 13.40);
        await context.SalaryEntries.AddAsync(salaryEntry);
        await context.SaveChangesAsync();

        var message = new SalarySubmittedEvent(salaryEntry.Id, "C#", 100000, "Berlin", DateTime.UtcNow);
        var consumeContext = new Mock<ConsumeContext<SalarySubmittedEvent>>();
        consumeContext.Setup(c => c.Message).Returns(message);

        // Act
        await consumer.Consume(consumeContext.Object);

        // Assert
        var average = await context.CityAverages
            .FirstOrDefaultAsync(ca => ca.City == "Berlin" && ca.Stack == "C#");
        Assert.NotNull(average);
        Assert.Equal(100000m, average!.AverageSalary);
        Assert.Equal(1, average.SampleSize);
        
        // Verify cache was called
        cacheMock.Verify(c => c.SetCachedAverageAsync("Berlin", "C#", 100000m), Times.Once);
    }

    [Fact]
    public async Task Consume_MultipleSalaries_UpdatesAverage()
    {
        // Arrange
        var context = CreateContext();
        var cacheMock = new Mock<ICacheService>();
        var consumer = new SalarySubmittedConsumer(context, cacheMock.Object);

        context.SalaryEntries.AddRange(
            new SalaryEntry("C#", 100000, "Berlin", 52.52, 13.40),
            new SalaryEntry("C#", 120000, "Berlin", 52.52, 13.40),
            new SalaryEntry("C#", 110000, "Berlin", 52.52, 13.40)
        );
        await context.SaveChangesAsync();

        var message = new SalarySubmittedEvent(Guid.NewGuid(), "C#", 110000, "Berlin", DateTime.UtcNow);
        var consumeContext = new Mock<ConsumeContext<SalarySubmittedEvent>>();
        consumeContext.Setup(c => c.Message).Returns(message);

        // Act
        await consumer.Consume(consumeContext.Object);

        // Assert
        var average = await context.CityAverages
            .FirstOrDefaultAsync(ca => ca.City == "Berlin" && ca.Stack == "C#");
        Assert.NotNull(average);
        Assert.Equal(110000m, average!.AverageSalary);
        Assert.Equal(3, average.SampleSize);
        
        // Verify cache was updated
        cacheMock.Verify(c => c.SetCachedAverageAsync("Berlin", "C#", 110000m), Times.Once);
    }
}