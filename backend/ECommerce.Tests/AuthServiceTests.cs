using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using ECommerce.Api.Repositories;
using ECommerce.Api.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace ECommerce.Tests;

public class AuthServiceTests
{
    private static IConfiguration BuildConfig() =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "TestKey_AtLeast32Chars_For_HmacSha256_!!!!",
            ["Jwt:Issuer"] = "Test",
            ["Jwt:Audience"] = "Test",
            ["Jwt:ExpirationMinutes"] = "60"
        }).Build();

    [Fact]
    public async Task Register_NewUser_ReturnsAuthResponseWithToken()
    {
        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        repo.Setup(r => r.CreateAsync(It.IsAny<User>())).ReturnsAsync(1);

        var service = new AuthService(repo.Object, BuildConfig());
        var result = await service.RegisterAsync(new RegisterDto
        {
            Email = "test@example.com",
            Password = "secret123",
            FirstName = "Test",
            LastName = "User"
        });

        Assert.NotNull(result);
        Assert.False(string.IsNullOrEmpty(result!.Token));
        Assert.Equal("test@example.com", result.Email);
    }

    [Fact]
    public async Task Register_WhenEmailExists_ReturnsNull()
    {
        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(true);

        var service = new AuthService(repo.Object, BuildConfig());
        var result = await service.RegisterAsync(new RegisterDto
        {
            Email = "exists@example.com",
            Password = "secret123",
            FirstName = "A",
            LastName = "B"
        });

        Assert.Null(result);
    }

    [Fact]
    public async Task Login_WithCorrectPassword_ReturnsToken()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("secret123");
        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.GetByEmailAsync("u@e.com")).ReturnsAsync(new User
        {
            Id = 1, Email = "u@e.com", PasswordHash = hash, FirstName = "X", LastName = "Y"
        });

        var service = new AuthService(repo.Object, BuildConfig());
        var result = await service.LoginAsync(new LoginDto { Email = "u@e.com", Password = "secret123" });

        Assert.NotNull(result);
        Assert.False(string.IsNullOrEmpty(result!.Token));
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsNull()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("real-password");
        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync(new User
        {
            Id = 1, Email = "u@e.com", PasswordHash = hash, FirstName = "X", LastName = "Y"
        });

        var service = new AuthService(repo.Object, BuildConfig());
        var result = await service.LoginAsync(new LoginDto { Email = "u@e.com", Password = "wrong" });

        Assert.Null(result);
    }
}
