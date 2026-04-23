using HenriTrips.Application.Common;
using HenriTrips.Application.DTOs.Auth;
using HenriTrips.Application.Interfaces;
using HenriTrips.Infrastructure.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HenriTrips.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }


[HttpPost("login")]
public async Task<IActionResult> Login(LoginDto dto)
{
    var token = await _authService.LoginAsync(dto.Email, dto.Password);

    return Ok(new ApiResponse<string>
    {
        Success = true,
        Data = token,
        Message = "Login successful"
    });
}

[HttpPost("register")]
public async Task<IActionResult> Register(RegisterDto dto)
{
    var result = await _authService.RegisterAsync(dto.Email, dto.Password);

    if (!result)
        return BadRequest(new ApiResponse<string>
        {
            Success = false,
            Message = "Registration failed"
        });

    return Ok(new ApiResponse<string>
    {
        Success = true,
        Message = "User created"
    });
}
}