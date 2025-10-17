using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FarkleGame.api.Migrations
{
    /// <inheritdoc />
    public partial class AddAIPlayerSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AIDifficulty",
                table: "Players",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsAI",
                table: "Players",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AIDifficulty",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "IsAI",
                table: "Players");
        }
    }
}
