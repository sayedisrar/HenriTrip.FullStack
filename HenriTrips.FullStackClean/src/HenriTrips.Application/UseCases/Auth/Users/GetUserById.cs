using Microsoft.AspNetCore.Identity;
using HenriTrips.Application.DTOs.Auth;

namespace HenriTrips.Application.UseCases.Auth.Users;

public class GetUserById
{
    private readonly UserManager<IdentityUser> _userManager;

    public GetUserById(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserResponseDto?> ExecuteAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);

        return new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email ?? "",
            UserName = user.UserName ?? "",
            Roles = roles.ToList()
        };
    }
}