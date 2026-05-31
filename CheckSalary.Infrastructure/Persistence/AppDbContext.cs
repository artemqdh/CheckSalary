using CheckSalary.Domain.Modules.Analytics.Entities;
using CheckSalary.Domain.Modules.SalarySubmission.Entities;
using Microsoft.EntityFrameworkCore;

namespace CheckSalary.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public DbSet<SalaryEntry> SalaryEntries => Set<SalaryEntry>();
    public DbSet<CityAverage> CityAverages => Set<CityAverage>();

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

            // Index on City + Stack for fast lookups
            entity.HasIndex(e => new { e.City, e.StackNormalized });
        });

        modelBuilder.Entity<CityAverage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.City, e.Stack }).IsUnique();
            entity.Property(e => e.AverageSalary).HasPrecision(18, 2);
            entity.Property(e => e.City).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Stack).IsRequired().HasMaxLength(200);
        });
    }
}