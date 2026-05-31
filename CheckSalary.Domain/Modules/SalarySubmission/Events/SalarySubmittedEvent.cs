namespace CheckSalary.Domain.Modules.SalarySubmission.Events
{
    public record SalarySubmittedEvent
    (
        Guid SalaryEntryId,
        string StackRaw,
        decimal Amount,
        string City,
        DateTime SubmittedAt
    );
}
