using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckSalary.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedCities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: false),
                    Longitude = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cities_Name",
                table: "Cities",
                column: "Name",
                unique: true);
            
            var cities = new[]
            {
                new { Name = "Berlin", Lat = 52.5200, Lng = 13.4050 },
                new { Name = "Hamburg", Lat = 53.5511, Lng = 9.9937 },
                new { Name = "Munich", Lat = 48.1351, Lng = 11.5820 },
                new { Name = "Cologne", Lat = 50.9375, Lng = 6.9603 },
                new { Name = "Frankfurt", Lat = 50.1109, Lng = 8.6821 },
                new { Name = "Stuttgart", Lat = 48.7758, Lng = 9.1829 },
                new { Name = "Düsseldorf", Lat = 51.2277, Lng = 6.7735 },
                new { Name = "Leipzig", Lat = 51.3397, Lng = 12.3731 },
                new { Name = "Dortmund", Lat = 51.5136, Lng = 7.4653 },
                new { Name = "Moscow", Lat = 55.7558, Lng = 37.6173 },
                new { Name = "St. Petersburg", Lat = 59.9343, Lng = 30.3351 },
                new { Name = "London", Lat = 51.5074, Lng = -0.1278 },
                new { Name = "Paris", Lat = 48.8566, Lng = 2.3522 },
                new { Name = "Amsterdam", Lat = 52.3676, Lng = 4.9041 },
                new { Name = "Warsaw", Lat = 52.2297, Lng = 21.0122 },
                new { Name = "Vienna", Lat = 48.2082, Lng = 16.3738 },
                new { Name = "Prague", Lat = 50.0755, Lng = 14.4378 },
                new { Name = "Barcelona", Lat = 41.3874, Lng = 2.1686 },
                new { Name = "Rome", Lat = 41.9028, Lng = 12.4964 },
                new { Name = "Stockholm", Lat = 59.3293, Lng = 18.0686 },
            };

            foreach (var city in cities)
            {
                var id = Guid.NewGuid();
                migrationBuilder.InsertData(
                    table: "Cities",
                    columns: new[] { "Id", "Name", "Latitude", "Longitude" },
                    values: new object[] { id, city.Name, city.Lat, city.Lng });
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cities");
            migrationBuilder.Sql("DELETE FROM \"Cities\"");
        }
    }
}
