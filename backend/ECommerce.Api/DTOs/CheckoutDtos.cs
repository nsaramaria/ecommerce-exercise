using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs;

// IMPORTANT: Frontend sends ONLY ProductId and Quantity.
// The backend looks up the price from the database — never trusts client price.
public class CheckoutItemDto
{
    [Required]
    public int ProductId { get; set; }

    [Required, Range(1, 100)]
    public int Quantity { get; set; }
}

public class CheckoutRequestDto
{
    [Required, MinLength(1)]
    public List<CheckoutItemDto> Items { get; set; } = new();

    [Required]
    public string ShippingAddress { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Country { get; set; } = string.Empty;

    [Required]
    public string ZipCode { get; set; } = string.Empty;
}

public class OrderResponseDto
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<OrderItemResponseDto> Items { get; set; } = new();
}

public class OrderItemResponseDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}
