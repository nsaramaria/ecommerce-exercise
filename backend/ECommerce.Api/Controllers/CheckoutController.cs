using ECommerce.Api.DTOs;
using ECommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CheckoutController : ControllerBase
{
    private readonly ICheckoutService _checkoutService;
    private readonly ILogger<CheckoutController> _logger;

    public CheckoutController(ICheckoutService checkoutService, ILogger<CheckoutController> logger)
    {
        _checkoutService = checkoutService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            var order = await _checkoutService.ProcessCheckoutAsync(userId, request);
            return Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Checkout failed for user {UserId}", userId);
            return BadRequest(new { message = ex.Message });
        }
    }
}
