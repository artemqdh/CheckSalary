using CheckSalary.Domain.Modules.Analytics.Interfaces;
using CheckSalary.Domain.Modules.SalarySubmission.Entities;
using Microsoft.EntityFrameworkCore;

namespace CheckSalary.Infrastructure.Persistence;

public class SalaryRepository : ISalaryRepository
{
    private readonly AppDbContext _context;

    public SalaryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(SalaryEntry entry, CancellationToken cancellationToken = default)
    {
        await _context.SalaryEntries.AddAsync(entry, cancellationToken);
    }

    public async Task<SalaryEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SalaryEntries.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<List<SalaryEntry>> GetByCityAndStackAsync(string city, string stack, CancellationToken cancellationToken = default)
    {
        return await _context.SalaryEntries
            .Where(e => e.City == city && e.StackNormalized == stack)
            .ToListAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}