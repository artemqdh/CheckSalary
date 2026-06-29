using System;

namespace CheckSalary.Domain.Modules.SalarySubmission.Entities
{
    public class SalaryEntry
    {
        public Guid Id { get; private set; }
        public string StackRaw { get; private set; }
        public string? StackNormalized { get; private set; }
        public decimal Amount { get; private set; }
        public string City { get; private set; }
        public int? Age { get; private set; }
        public int WorkExperience { get; private set; }
        public int? CompanySize { get; private set; }
        public double Latitude { get; private set; }
        public double Longitude { get; private set; }
        public string Level { get; private set; }
        public DateTime CreatedAt { get; private set; }

        private SalaryEntry() { }

        public SalaryEntry(
            string stackRaw,
            decimal amount,
            string city,
            double latitude,
            double longitude,
            string level,
            int workExperience,
            int? age = null,
            int? companySize = null)
        {
            Id = Guid.NewGuid();
            StackRaw = stackRaw;
            Amount = amount;
            City = city;
            Latitude = latitude;
            Longitude = longitude;
            Level = level;
            WorkExperience = workExperience;
            Age = age;
            CompanySize = companySize;
            CreatedAt = DateTime.UtcNow;
        }

        public void SetNormalizedStack(string normalized)
        {
            StackNormalized = normalized;
        }
    }
}