using ECommerce.Api.Data;
using ECommerce.Api.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ECommerce.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task<int> CreateAsync(User user);
    Task<bool> EmailExistsAsync(string email);
}

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var conn = (SqlConnection)_connectionFactory.CreateConnection();
        await conn.OpenAsync();

        const string sql = @"SELECT Id, Email, PasswordHash, FirstName, LastName, CreatedAt
                             FROM Users WHERE Email = @Email";
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.Add(new SqlParameter("@Email", SqlDbType.NVarChar, 256) { Value = email });

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync()) return MapUser(reader);
        return null;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        using var conn = (SqlConnection)_connectionFactory.CreateConnection();
        await conn.OpenAsync();

        const string sql = @"SELECT Id, Email, PasswordHash, FirstName, LastName, CreatedAt
                             FROM Users WHERE Id = @Id";
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.Add(new SqlParameter("@Id", SqlDbType.Int) { Value = id });

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync()) return MapUser(reader);
        return null;
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        using var conn = (SqlConnection)_connectionFactory.CreateConnection();
        await conn.OpenAsync();

        const string sql = "SELECT COUNT(1) FROM Users WHERE Email = @Email";
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.Add(new SqlParameter("@Email", SqlDbType.NVarChar, 256) { Value = email });

        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(result) > 0;
    }

    public async Task<int> CreateAsync(User user)
    {
        using var conn = (SqlConnection)_connectionFactory.CreateConnection();
        await conn.OpenAsync();

        const string sql = @"INSERT INTO Users (Email, PasswordHash, FirstName, LastName, CreatedAt)
                             OUTPUT INSERTED.Id
                             VALUES (@Email, @PasswordHash, @FirstName, @LastName, @CreatedAt)";
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.Add(new SqlParameter("@Email", SqlDbType.NVarChar, 256) { Value = user.Email });
        cmd.Parameters.Add(new SqlParameter("@PasswordHash", SqlDbType.NVarChar, 512) { Value = user.PasswordHash });
        cmd.Parameters.Add(new SqlParameter("@FirstName", SqlDbType.NVarChar, 100) { Value = user.FirstName });
        cmd.Parameters.Add(new SqlParameter("@LastName", SqlDbType.NVarChar, 100) { Value = user.LastName });
        cmd.Parameters.Add(new SqlParameter("@CreatedAt", SqlDbType.DateTime2) { Value = user.CreatedAt });

        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    private static User MapUser(IDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal("Id")),
        Email = reader.GetString(reader.GetOrdinal("Email")),
        PasswordHash = reader.GetString(reader.GetOrdinal("PasswordHash")),
        FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
        LastName = reader.GetString(reader.GetOrdinal("LastName")),
        CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
    };
}
