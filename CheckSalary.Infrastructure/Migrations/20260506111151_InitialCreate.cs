using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckSalary.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.CreateTable(
                name: "CityAverages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    City = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Stack = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AverageSalary = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    SampleSize = table.Column<int>(type: "integer", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CityAverages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalaryEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StackRaw = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StackNormalized = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    City = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: false),
                    Longitude = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalaryEntries", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CityAverages_City_Stack",
                table: "CityAverages",
                columns: new[] { "City", "Stack" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalaryEntries_City_StackNormalized",
                table: "SalaryEntries",
                columns: new[] { "City", "StackNormalized" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CityAverages");

            migrationBuilder.DropTable(
                name: "SalaryEntries");
        }
    }
}
