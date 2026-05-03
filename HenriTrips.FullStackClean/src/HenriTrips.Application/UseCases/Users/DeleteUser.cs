using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Application.UseCases.Users;

public class DeleteUser
{
    private readonly UserManager<IdentityUser> _userManager;

    public DeleteUser(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<(bool Success, IEnumerable<IdentityError>? Errors)> ExecuteAsync(string

 userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return (false, null);

        var result = await _userManager.DeleteAsync(user);
        
        if (!result.Succeeded)
            return (false, result.Errors);

        return (true, null);
    }
}
