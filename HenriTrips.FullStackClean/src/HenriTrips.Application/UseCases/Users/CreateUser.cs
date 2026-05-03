using HenriTrips.Application.DTOs.Auth;
using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Application.UseCases.Users;

public class CreateUser
{
    private readonly UserManager<IdentityUser> _userManager;

    public CreateUser(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<(bool Success, string? UserId, IEnumerable<IdentityError>? Errors)> ExecuteAsync(CreateUserDto dto)
    {
        var user = new IdentityUser
        {
            UserName = dto.Email,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        
        if (!result.Succeeded)
 













           return (false, null, result.Errors);

        await _userManager.AddToRoleAsync(user, dto.Role);

        return (true, user.Id, null);
    }
}
