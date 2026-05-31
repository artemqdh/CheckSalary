namespace CheckSalary.Domain.Modules.Analytics.Entities
{
    public class CityAverage
    {
        public Guid Id { get; private set; }
        public string City { get; private set; }
        public string Stack { get; private set; } // normalized stack name
        public decimal AverageSalary { get; private set; }
        public int SampleSize { get; private set; }
        public DateTime LastUpdated { get; private set; }

        private CityAverage() { }

        public CityAverage(string city, string stack, decimal averageSalary, int sampleSize)
        {
            Id = Guid.NewGuid();
            City = city;
            Stack = stack;
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
