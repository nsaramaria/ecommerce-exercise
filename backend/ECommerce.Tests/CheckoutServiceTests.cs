using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using ECommerce.Api.Repositories;
using ECommerce.Api.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace ECommerce.Tests;

public class CheckoutServiceTests
{
    private readonly Mock<IProductRepository> _productRepoMock = new();
    private readonly Mock<IOrderRepository> _orderRepoMock = new();

    private CheckoutService CreateService() => new(
        _productRepoMock.Object,
        _orderRepoMock.Object,
        NullLogger<CheckoutService>.Instance);

    [Fact]
    public async Task ProcessCheckout_CalculatesTotalFromDatabase_IgnoresClientPrice()
    {
        // Arrange — a customer claims a price; we ensure it's ignored.
        var products = new List<Product>
        {
            new() { Id = 1, Name = "T-Shirt",   Price = 25.00m, StockQuantity = 10 },
            new() { Id = 2, Name = "Jeans",     Price = 60.00m, StockQuantity = 5  }
        };
        _productRepoMock.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(products);
        _orderRepoMock.Setup(r => r.CreateOrderAsync(It.IsAny<Order>())).ReturnsAsync(42);

        var request = new CheckoutRequestDto
        {
            Items = new List<CheckoutItemDto>
            {
                new() { ProductId = 1, Quantity = 2 }, // expected: 50
                new() { ProductId = 2, Quantity = 1 }  // expected: 60
            },
            ShippingAddress = "123 Test St",
            City = "Craiova",
            Country = "Romania",
            ZipCode = "200000"
        };

        // Act
        var result = await CreateService().ProcessCheckoutAsync(userId: 99, request);

        // Assert
        Assert.Equal(110.00m, result.TotalAmount);
        Assert.Equal(42, result.OrderId);
        Assert.Equal(2, result.Items.Count);
        Assert.Equal(25.00m, result.Items.First(i => i.ProductId == 1).UnitPrice);
        Assert.Equal(60.00m, result.Items.First(i => i.ProductId == 2).UnitPrice);
    }

    [Fact]
    public async Task ProcessCheckout_WhenProductMissing_Throws()
    {
        _productRepoMock.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new List<Product>()); // empty -> nothing found

        var request = new CheckoutRequestDto
        {
            Items = new() { new() { ProductId = 999, Quantity = 1 } },
            ShippingAddress = "x", City = "x", Country = "x", ZipCode = "x"
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => CreateService().ProcessCheckoutAsync(1, request));
        Assert.Contains("not found", ex.Message);
    }

    [Fact]
    public async Task ProcessCheckout_WhenStockInsufficient_Throws()
    {
        _productRepoMock.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new List<Product>
            {
                new() { Id = 1, Name = "Hat", Price = 10m, StockQuantity = 2 }
            });

        var request = new CheckoutRequestDto
        {
            Items = new() { new() { ProductId = 1, Quantity = 5 } },
            ShippingAddress = "x", City = "x", Country = "x", ZipCode = "x"
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => CreateService().ProcessCheckoutAsync(1, request));
        Assert.Contains("Insufficient stock", ex.Message);
    }

    [Fact]
    public async Task ProcessCheckout_WhenCartEmpty_Throws()
    {
        var request = new CheckoutRequestDto
        {
            Items = new(),
            ShippingAddress = "x", City = "x", Country = "x", ZipCode = "x"
        };

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => CreateService().ProcessCheckoutAsync(1, request));
    }

    [Fact]
    public async Task ProcessCheckout_ConsolidatesDuplicateProductLines()
    {
        _productRepoMock.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new List<Product>
            {
                new() { Id = 1, Name = "Mug", Price = 5m, StockQuantity = 100 }
            });
        _orderRepoMock.Setup(r => r.CreateOrderAsync(It.IsAny<Order>())).ReturnsAsync(1);

        var request = new CheckoutRequestDto
        {
            Items = new()
            {
                new() { ProductId = 1, Quantity = 2 },
                new() { ProductId = 1, Quantity = 3 }
            },
            ShippingAddress = "x", City = "x", Country = "x", ZipCode = "x"
        };

        var result = await CreateService().ProcessCheckoutAsync(1, request);
        Assert.Single(result.Items);
        Assert.Equal(5, result.Items[0].Quantity);
        Assert.Equal(25m, result.TotalAmount);
    }
}
