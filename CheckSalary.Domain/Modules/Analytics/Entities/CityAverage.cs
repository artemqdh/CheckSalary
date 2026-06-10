namespace CheckSalary.Domain.Modules.Analytics.Entities
{
    public class CityAverage
    {
        public Guid Id { get; private set; }
        public string City { get; private set; }
        public string Stack { get; private set; } // normalized stack name
        public string Level { get; private set; } // Junior, Middle, Senior
        public decimal AverageSalary { get; private set; }
        public int SampleSize { get; private set; }
        public DateTime LastUpdated { get; private set; }

        private CityAverage() { }

        public CityAverage(string city, string stack, string level, decimal averageSalary, int sampleSize)
        {
            Id = Guid.NewGuid();
            City = city;
            Stack = stack;
            Level = level;
            AverageSalary = averageSalary;
            SampleSize = sampleSize;
            LastUpdated = DateTime.UtcNow;
        }

        public void UpdateAverage(decimal newAverage, int newSampleSize)
        {
            AverageSalary = newAverage;
            SampleSize = newSampleSize;
            LastUpdated = DateTime.UtcNow;
        }
    }
}
