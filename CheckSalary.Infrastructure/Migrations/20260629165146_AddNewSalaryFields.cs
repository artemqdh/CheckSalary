using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckSalary.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNewSalaryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Age",
                table: "SalaryEntries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanySize",
                table: "SalaryEntries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkExperience",
                table: "SalaryEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Age",
                table: "SalaryEntries");

            migrationBuilder.DropColumn(
                name: "CompanySize",
                table: "SalaryEntries");

            migrationBuilder.DropColumn(
                name: "WorkExperience",
                table: "SalaryEntries");
        }
    }
}
