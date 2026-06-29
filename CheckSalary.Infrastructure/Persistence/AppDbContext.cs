using CheckSalary.Domain.Modules.Analytics.Entities;
using CheckSalary.Domain.Modules.SalarySubmission.Entities;
using CheckSalary.Domain.Modules.SearchDiscovery.Entities;
using Microsoft.EntityFrameworkCore;

namespace CheckSalary.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public DbSet<SalaryEntry> SalaryEntries => Set<SalaryEntry>();
    public DbSet<CityAverage> CityAverages => Set<CityAverage>();
    public DbSet<City> Cities => Set<City>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SalaryEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StackRaw).IsRequired().HasMaxLength(200);
            entity.Property(e => e.StackNormalized).HasMaxLength(200);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.City).IsRequired().HasMaxLength(200);

            // Store Latitude and Longitude
            entity.Property(e => e.Latitude).IsRequired();
            entity.Property(e => e.Longitude).IsRequired();

            entity.Property(e => e.Level).IsRequired().HasMaxLength(50);
            
            entity.Property(e => e.WorkExperience).IsRequired();
            entity.Property(e => e.Age).IsRequired(false);
            entity.Property(e => e.CompanySize).IsRequired(false);
            
            // Index on City + Stack for fast lookups
            entity.HasIndex(e => new { e.City, e.StackNormalized });
        });

        modelBuilder.Entity<CityAverage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.City, e.Stack, e.Level }).IsUnique();
            entity.Property(e => e.Level).IsRequired().HasMaxLength(50);
            entity.Property(e => e.AverageSalary).HasPrecision(18, 2);
            entity.Property(e => e.City).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Stack).IsRequired().HasMaxLength(200);
        });
        
        modelBuilder.Entity<City>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
        });
    }
}