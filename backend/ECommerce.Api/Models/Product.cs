namespace ECommerce.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public string TubeColor { get; set; } = "#D4A89B";
    public string CardBgColor { get; set; } = "#EFD9CC";
}
