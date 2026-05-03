using HenriTrips.Application.DTOs.Auth;
using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Application.UseCases.Users;

public class GetAllUsers
{
    private readonly UserManager<IdentityUser> _userManager;

    public GetAllUsers(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<List<UserResponseDto>> ExecuteAsync()
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

        return result;
    }
}
