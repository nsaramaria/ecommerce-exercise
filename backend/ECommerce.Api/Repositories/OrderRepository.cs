using ECommerce.Api.Data;
using ECommerce.Api.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ECommerce.Api.Repositories;

public interface IOrderRepository
{
    Task<int> CreateOrderAsync(Order order);
    Task<Order?> GetByIdAsync(int id);
}

public class OrderRepository : IOrderRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public OrderRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<int> CreateOrderAsync(Order order)
    {
        using var conn = (SqlConnection)_connectionFactory.CreateConnection();
        await conn.OpenAsync();
        using var transaction = conn.BeginTransaction();

        try
        {
            // Insert Order header
            const string orderSql = @"
                INSERT INTO Orders (UserId, OrderDate, TotalAmount, ShippingAddress, City, Country, ZipCode, Status)
                OUTPUT INSERTED.Id
                VALUES (@UserId, @OrderDate, @TotalAmount, @ShippingAddress, @City, @Country, @ZipCode, @Status)";

            int orderId;
            using (var cmd = new SqlCommand(orderSql, conn, transaction))
            {
                cmd.Parameters.AddWithValue("@UserId", order.UserId);
                cmd.Parameters.AddWithValue("@OrderDate", order.OrderDate);
                cmd.Parameters.AddWithValue("@TotalAmount", order.TotalAmount);
                cmd.Parameters.AddWithValue("@ShippingAddress", order.ShippingAddress);
                cmd.Parameters.AddWithValue("@City", order.City);
                cmd.Parameters.AddWithValue("@Country", order.Country);
                cmd.Parameters.AddWithValue("@ZipCode", order.ZipCode);
                cmd.Parameters.AddWithValue("@Status", order.Status);

                var result = await cmd.ExecuteScalarAsync();
                orderId = Convert.ToInt32(result);
            }

            // Insert Order items
            const string itemSql = @"
                INSERT INTO OrderItems (OrderId, ProductId, ProductName, Quantity, UnitPrice)
                VALUES (@OrderId, @ProductId, @ProductName, @Quantity, @UnitPrice)";

            foreach (var item in order.Items)
            {
                using var itemCmd = new SqlCommand(itemSql, conn, transaction);
                itemCmd.Parameters.AddWithValue("@OrderId", orderId);
                itemCmd.Parameters.AddWithValue("@ProductId", item.ProductId);
                itemCmd.Parameters.AddWithValue("@ProductName", item.ProductName);
                itemCmd.Parameters.AddWithValue("@Quantity", item.Quantity);
                itemCmd.Parameters.AddWithValue("@UnitPrice", item.UnitPrice);
                await itemCmd.ExecuteNonQueryAsync();
            }

            transaction.Commit();
            return orderId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<Order?> GetByIdAsync(int id)
    {
        using var conn = (SqlConnection)_connectionFactory.CreateConnection();
        await conn.OpenAsync();

        const string orderSql = @"SELECT Id, UserId, OrderDate, TotalAmount, ShippingAddress,
                                         City, Country, ZipCode, Status
                                  FROM Orders WHERE Id = @Id";
        Order? order = null;
        using (var cmd = new SqlCommand(orderSql, conn))
        {
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                order = new Order
                {
                    Id = reader.GetInt32(0),
                    UserId = reader.GetInt32(1),
                    OrderDate = reader.GetDateTime(2),
                    TotalAmount = reader.GetDecimal(3),
                    ShippingAddress = reader.GetString(4),
                    City = reader.GetString(5),
                    Country = reader.GetString(6),
                    ZipCode = reader.GetString(7),
                    Status = reader.GetString(8)
                };
            }
        }

        if (order == null) return null;

        const string itemsSql = @"SELECT Id, OrderId, ProductId, ProductName, Quantity, UnitPrice
                                  FROM OrderItems WHERE OrderId = @OrderId";
        using (var cmd = new SqlCommand(itemsSql, conn))
        {
            cmd.Parameters.AddWithValue("@OrderId", id);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                order.Items.Add(new OrderItem
                {
                    Id = reader.GetInt32(0),
                    OrderId = reader.GetInt32(1),
                    ProductId = reader.GetInt32(2),
                    ProductName = reader.GetString(3),
                    Quantity = reader.GetInt32(4),
                    UnitPrice = reader.GetDecimal(5)
                });
            }
        }
        return order;
    }
}
