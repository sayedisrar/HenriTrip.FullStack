using HenriTrips.Application.DTOs.Auth;
using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Application.UseCases.Users;

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
            Email = user.Email ?? string.Empty,
            UserName = user.UserName ?? string.Empty,
            Roles = roles.ToList()
        };
    }
}
