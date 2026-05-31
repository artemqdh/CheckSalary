

namespace CheckSalary.Domain.Modules.SalarySubmission.Entities
{
    public class SalaryEntry
    {
        public Guid Id { get; private set; }
        public string StackRaw { get; private set; } // User input raw "C-Sharp"
        public string? StackNormalized { get; private set; } // normalized "C#"
        public decimal Amount { get; private set; }
        public string City { get; private set; }
        public double Latitude { get; private set; }
        public double Longitude { get; private set; }
        public DateTime CreatedAt { get; private set; }

        private SalaryEntry() { }

        public SalaryEntry(string stackRaw, decimal amount, string city, double latitude, double longitude)
        {
            Id = Guid.NewGuid();
            StackRaw = stackRaw;
            Amount = amount;
            City = city;
            Latitude = latitude;
            Longitude = longitude;
            CreatedAt = DateTime.UtcNow;
        }

        public void SetNormalizedStack(string normalized)
        {
            StackNormalized = normalized;
        }
    }
}
