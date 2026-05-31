namespace CheckSalary.Application.Modules.SalarySubmission.Services;

public interface IStackNormalizer
{
    Task<NormalizedStackResult> NormalizeAsync(string rawStack);
}

public record NormalizedStackResult(string Normalized, double Confidence);