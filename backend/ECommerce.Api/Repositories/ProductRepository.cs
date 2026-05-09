using ECommerce.Api.Data;
using ECommerce.Api.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ECommerce.Api.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetByIdsAsync(IEnumerable<int> ids);
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

    public async Task<IEnumerable<Product>> GetByIdsAsync(IEnumerable<int> ids)
    {
        var idList = ids.Distinct().ToList();
        if (!idList.Any()) return Enumerable.Empty<Product>();

        var products = new List<Product>();
        using var conn = (SqlConnection)_connectionFactory.CreateConnection();
        await conn.OpenAsync();

        // Build parameterized IN clause - never string-concat user input.
        var paramNames = idList.Select((_, i) => $"@p{i}").ToList();
        var sql = $@"SELECT Id, Name, Category, Brand, Price, Description, ImageUrl, StockQuantity
                     FROM Products WHERE Id IN ({string.Join(",", paramNames)})";

        using var cmd = new SqlCommand(sql, conn);
        for (int i = 0; i < idList.Count; i++)
        {
            cmd.Parameters.Add(new SqlParameter(paramNames[i], SqlDbType.Int) { Value = idList[i] });
        }

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            products.Add(MapProduct(reader));
        }
        return products;
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
