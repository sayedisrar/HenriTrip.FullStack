using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Application.UseCases.Auth.Users;

public class DeleteUser
{
    private readonly UserManager<IdentityUser> _userManager;

    public DeleteUser(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<(bool Success, string? Error)> ExecuteAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return (false, "User not found");

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
            return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

        return (true, null);
    }
}