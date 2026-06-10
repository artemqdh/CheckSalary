using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckSalary.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLevelCol : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CityAverages_City_Stack",
                table: "CityAverages");

            migrationBuilder.AddColumn<string>(
                name: "Level",
                table: "SalaryEntries",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Level",
                table: "CityAverages",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CityAverages_City_Stack_Level",
                table: "CityAverages",
                columns: new[] { "City", "Stack", "Level" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CityAverages_City_Stack_Level",
                table: "CityAverages");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "SalaryEntries");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "CityAverages");

            migrationBuilder.CreateIndex(
                name: "IX_CityAverages_City_Stack",
                table: "CityAverages",
                columns: new[] { "City", "Stack" },
                unique: true);
        }
    }
}
