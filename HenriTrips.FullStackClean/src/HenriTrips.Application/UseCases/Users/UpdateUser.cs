using HenriTrips.Application.DTOs.Auth;
using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Application.UseCases.Users;

public class UpdateUser
{
    private readonly UserManager<IdentityUser> _userManager;

    public UpdateUser(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<(bool Success, UserResponseDto? User, IEnumerable<IdentityError>? Errors)> ExecuteAsync(string userId, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return (false, null, null);

        // Update Email
        if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
        {
            user.Email = dto.Email;
            user.UserName = dto.Email;
            user.NormalizedEmail = dto.Email.ToUpperInvariant();
            user.NormalizedUserName = dto.Email.ToUpperInvariant();
        }

        // Update Role
        if (!string.IsNullOrEmpty(dto.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        // Update Password
        if (!string.IsNullOrEmpty(dto.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            await _userManager.ResetPasswordAsync(user, token, dto.Password);
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return (false, null, updateResult.Errors);

        var updatedRoles = await _userManager.GetRolesAsync(user);

        var userDto = new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            UserName = user.UserName ?? string.Empty,
            Roles = updatedRoles.ToList()
        };

        return (true, userDto, null);
    }
}