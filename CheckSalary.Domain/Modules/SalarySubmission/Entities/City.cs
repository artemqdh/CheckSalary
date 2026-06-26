namespace CheckSalary.Domain.Modules.SearchDiscovery.Entities;

public class City
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }

    private City() { }

    public City(string name, double latitude, double longitude)
    {
        Id = Guid.NewGuid();
        Name = name;
        Latitude = latitude;
        Longitude = longitude;
    }
}