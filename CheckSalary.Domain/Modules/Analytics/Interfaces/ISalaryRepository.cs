using CheckSalary.Domain.Modules.SalarySubmission.Entities;

namespace CheckSalary.Domain.Modules.Analytics.Interfaces
{
    public interface ISalaryRepository
    {
        Task AddAsync(SalaryEntry entry, CancellationToken cancellationToken = default);
        Task<SalaryEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<List<SalaryEntry>> GetByCityAndStackAsync(string city, string stack, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
