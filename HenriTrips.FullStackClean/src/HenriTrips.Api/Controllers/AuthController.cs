using HenriTrips.Application.Common;
using HenriTrips.Application.DTOs.Auth;
using HenriTrips.Application.Interfaces;
using HenriTrips.Application.UseCases.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HenriTrips.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly UserManager<IdentityUser> _userManager;

    public AuthController(IAuthService authService, UserManager<IdentityUser> userManager)
    {
        _authService = authService;
        _userManager = userManager;
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

    // ========== ADMIN USER MANAGEMENT ENDPOINTS ==========

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = _userManager.Users.ToList();
        var result = new List<UserResponseDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                Roles = roles.ToList()
            });
        }

        return Ok(new ApiResponse<List<UserResponseDto>>
        {
            Success = true,
            Data = result
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUserById(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "User not found"
            });

        var roles = await _userManager.GetRolesAsync(user);

        var userDto = new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            UserName = user.UserName ?? string.Empty,
            Roles = roles.ToList()
        };

        return Ok(new ApiResponse<UserResponseDto>
        {
            Success = true,
            Data = userDto
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("create-user")]
    public async Task<IActionResult> CreateUser(CreateUserDto dto)
    {
        var user = new IdentityUser
        {
            UserName = dto.Email,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = string.Join(", ", result.Errors.Select(e => e.Description))
            });
        }

        await _userManager.AddToRoleAsync(user, dto.Role);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { UserId = user.Id, Message = "User created successfully" }
        });
    }


    [Authorize(Roles = "Admin")]
    [HttpPut("users/{userId}")]
    public async Task<IActionResult> UpdateUser(string userId, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "User not found"
            });

        // Update Email
        if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
        {
            user.Email = dto.Email;
            user.UserName = dto.Email;
        }

        // Update Role
        if (!string.IsNullOrEmpty(dto.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        // Update Password - Direct hash (MORE RELIABLE)
        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, dto.Password);
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = string.Join(", ", updateResult.Errors.Select(e => e.Description))
            });
        }

        var updatedRoles = await _userManager.GetRolesAsync(user);

        var userDto = new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            UserName = user.UserName ?? string.Empty,
            Roles = updatedRoles.ToList()
        };

        return Ok(new ApiResponse<UserResponseDto>
        {
            Success = true,
            Data = userDto
        });
    }
    [Authorize(Roles = "Admin")]
    [HttpDelete("delete-user/{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "User not found"
            });

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = string.Join(", ", result.Errors.Select(e => e.Description))
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "User deleted successfully"
        });
    }
}