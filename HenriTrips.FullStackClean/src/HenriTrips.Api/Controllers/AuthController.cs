using HenriTrips.Application.Common;
using HenriTrips.Application.DTOs.Auth;
using HenriTrips.Application.Interfaces;
using HenriTrips.Application.UseCases.Auth.Users;
using HenriTrips.Application.UseCases.Guides;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HenriTrips.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly GetAllUsers _getAllUsers;
    private readonly GetUserById _getUserById;
    private readonly CreateUser _createUser;
    private readonly UpdateUser _updateUser;
    private readonly DeleteUser _deleteUser;

    public AuthController(
        IAuthService authService,
        GetAllUsers getAllUsers,
        GetUserById getUserById,
        CreateUser createUser,
        UpdateUser updateUser,
        DeleteUser deleteUser)
    {
        _authService = authService;
        _getAllUsers = getAllUsers;
        _getUserById = getUserById;
        _createUser = createUser;
        _updateUser = updateUser;
        _deleteUser = deleteUser;
    }

    // ================= AUTHENTICATION =================

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var token = await _authService.LoginAsync(dto.Email, dto.Password);
        return Ok(new ApiResponse<string> { Success = true, Data = token, Message = "Login successful" });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto.Email, dto.Password);
        if (!result)
            return BadRequest(new ApiResponse<object> { Success = false, Message = "Registration failed" });
        return Ok(new ApiResponse<object> { Success = true, Message = "User created successfully" });
    }

    // ================= USER MANAGEMENT (Admin Only) =================

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _getAllUsers.ExecuteAsync();
        return Ok(new ApiResponse<object> { Success = true, Data = users });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUserById(string userId)
    {
        var user = await _getUserById.ExecuteAsync(userId);
        if (user == null)
            return NotFound(new ApiResponse<object> { Success = false, Message = "User not found" });
        return Ok(new ApiResponse<object> { Success = true, Data = user });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("create-user")]
    public async Task<IActionResult> CreateUser(CreateUserDto dto)
    {
        var result = await _createUser.ExecuteAsync(dto);
        if (!result.Success)
            return BadRequest(new ApiResponse<object> { Success = false, Message = result.Error });
        return Ok(new ApiResponse<object> { Success = true, Data = new { UserId = result.UserId }, Message = "User created successfully" });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("users/{userId}")]
    public async Task<IActionResult> UpdateUser(string userId, UpdateUserDto dto)
    {
        var result = await _updateUser.ExecuteAsync(userId, dto);
        if (!result.Success)
            return BadRequest(new ApiResponse<object> { Success = false, Message = result.Error });
        return Ok(new ApiResponse<object> { Success = true, Message = "User updated successfully" });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("delete-user/{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        var result = await _deleteUser.ExecuteAsync(userId);
        if (!result.Success)
            return BadRequest(new ApiResponse<object> { Success = false, Message = result.Error });
        return Ok(new ApiResponse<object> { Success = true, Message = "User deleted successfully" });
    }

    // ================= USER GUIDE INVITATIONS =================
    // Only ONE endpoint kept here - the one used by frontend for users to see their own guides

    [Authorize]
    [HttpGet("users/{userId}/invited-guides")]
    public async Task<IActionResult> GetUserInvitedGuides(string userId, [FromServices] GetUserInvitedGuides getUserInvitedGuides)
    {
        // Security: Users can only see their own guides
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin && currentUserId != userId)
            return Forbid();

        var guideIds = await getUserInvitedGuides.ExecuteAsync(userId);
        return Ok(new ApiResponse<object> { Success = true, Data = guideIds });
    }
}