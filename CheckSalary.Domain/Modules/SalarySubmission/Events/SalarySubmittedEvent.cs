namespace CheckSalary.Domain.Modules.SalarySubmission.Events
{
    public record SalarySubmittedEvent(
        Guid SalaryEntryId,
        string StackRaw,
        decimal Amount,
        string City,
        string Level,
        int WorkExperience,
        int? Age,
        int? CompanySize,
        DateTime SubmittedAt
    );
}
