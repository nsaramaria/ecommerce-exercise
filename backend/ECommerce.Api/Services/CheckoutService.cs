using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using ECommerce.Api.Repositories;

namespace ECommerce.Api.Services;

public interface ICheckoutService
{
    Task<OrderResponseDto> ProcessCheckoutAsync(int userId, CheckoutRequestDto request);
}

public class CheckoutService : ICheckoutService
{
    private readonly IProductRepository _productRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<CheckoutService> _logger;

    public CheckoutService(
        IProductRepository productRepository,
        IOrderRepository orderRepository,
        ILogger<CheckoutService> logger)
    {
        _productRepository = productRepository;
        _orderRepository = orderRepository;
        _logger = logger;
    }

    public async Task<OrderResponseDto> ProcessCheckoutAsync(int userId, CheckoutRequestDto request)
    {
        if (request.Items == null || !request.Items.Any())
            throw new InvalidOperationException("Cart is empty.");

        // Consolidate duplicate product entries (defensive: client may send same product twice)
        var consolidated = request.Items
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity) })
            .ToList();

        // Fetch ALL prices from the database — this is the heart of the requirement.
        var productIds = consolidated.Select(i => i.ProductId).ToList();
        var products = (await _productRepository.GetByIdsAsync(productIds)).ToDictionary(p => p.Id);

        // Validate every requested product exists
        var missing = productIds.Where(id => !products.ContainsKey(id)).ToList();
        if (missing.Any())
            throw new InvalidOperationException($"Products not found: {string.Join(", ", missing)}");

        // Build the order using DB-sourced prices and validate stock
        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            ShippingAddress = request.ShippingAddress,
            City = request.City,
            Country = request.Country,
            ZipCode = request.ZipCode,
            Status = "Confirmed"
        };

        decimal computedTotal = 0m;
        foreach (var item in consolidated)
        {
            var product = products[item.ProductId];
            if (product.StockQuantity < item.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for '{product.Name}'. Available: {product.StockQuantity}, Requested: {item.Quantity}.");

            var lineTotal = product.Price * item.Quantity;
            computedTotal += lineTotal;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = item.Quantity,
                UnitPrice = product.Price // From DB, not the client.
            });
        }

        order.TotalAmount = computedTotal;
        var orderId = await _orderRepository.CreateOrderAsync(order);

        _logger.LogInformation("Order {OrderId} created for user {UserId} with total {Total:C}",
            orderId, userId, computedTotal);

        return new OrderResponseDto
        {
            OrderId = orderId,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            Items = order.Items.Select(i => new OrderItemResponseDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Subtotal = i.Subtotal
            }).ToList()
        };
    }
}
