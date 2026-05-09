using ECommerce.Api.Data;
using ECommerce.Api.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ECommerce.Api.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
}

public class ProductRepository : IProductRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ProductRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        var products = new List<Product>();
        using var conn = (SqlConnection)_connectionFactory.CreateConnection();
        await conn.OpenAsync();

        const string sql = @"SELECT Id, Name, Category, Brand, Price, Description, ImageUrl, StockQuantity
                             FROM Products ORDER BY Id";
        using var cmd = new SqlCommand(sql, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            products.Add(MapProduct(reader));
        }
        return products;
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        using var conn = (SqlConnection)_connectionFactory.CreateConnection();
        await conn.OpenAsync();

        const string sql = @"SELECT Id, Name, Category, Brand, Price, Description, ImageUrl, StockQuantity
                             FROM Products WHERE Id = @Id";
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.Add(new SqlParameter("@Id", SqlDbType.Int) { Value = id });

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return MapProduct(reader);
        }
        return null;
    }

    private static Product MapProduct(IDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal("Id")),
        Name = reader.GetString(reader.GetOrdinal("Name")),
        Category = reader.GetString(reader.GetOrdinal("Category")),
        Brand = reader.GetString(reader.GetOrdinal("Brand")),
        Price = reader.GetDecimal(reader.GetOrdinal("Price")),
        Description = reader.GetString(reader.GetOrdinal("Description")),
        ImageUrl = reader.GetString(reader.GetOrdinal("ImageUrl")),
        StockQuantity = reader.GetInt32(reader.GetOrdinal("StockQuantity"))
    };
}
