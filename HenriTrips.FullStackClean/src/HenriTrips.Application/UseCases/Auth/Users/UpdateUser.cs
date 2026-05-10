using Microsoft.AspNetCore.Identity;
using HenriTrips.Application.DTOs.Auth;
using HenriTrips.Application.Interfaces;
using HenriTrips.Domain.Entities;

namespace HenriTrips.Application.UseCases.Auth.Users;

public class UpdateUser
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IGuideUserRepository _guideUserRepository;

    public UpdateUser(
        UserManager<IdentityUser> userManager,
        IGuideUserRepository guideUserRepository)
    {
        _userManager = userManager;
        _guideUserRepository = guideUserRepository;
    }

    public async Task<(bool Success, string? Error)> ExecuteAsync(string userId, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return (false, "User not found");

        // Update Email
        if (!string.IsNullOrEmpty(dto.Email))
        {
            user.Email = dto.Email;
            user.UserName = dto.Email;
        }

        // Update Role
        if (!string.IsNullOrEmpty(dto.Role))
        {
            var roles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, roles);
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        // Update password if provided
        if (!string.IsNullOrEmpty(dto.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetResult = await _userManager.ResetPasswordAsync(user, token, dto.Password);

            if (!resetResult.Succeeded)
            {
                return (false, string.Join(", ", resetResult.Errors.Select(e => e.Description)));
            }
        }

        // Update user basic info first
        var update = await _userManager.UpdateAsync(user);
        if (!update.Succeeded)
            return (false, string.Join(", ", update.Errors.Select(e => e.Description)));

        // ===== CRITICAL FIX: Update Guide assignments =====
        // Only update guide assignments if GuideIds is provided (not null)
        if (dto.GuideIds != null)
        {
            Console.WriteLine($"Updating guide assignments for user {userId}");
            Console.WriteLine($"New GuideIds: {string.Join(", ", dto.GuideIds)}");

            // Remove all current guide assignments
            await _guideUserRepository.RemoveAllUserGuidesAsync(userId);

            // Add new guide assignments
            foreach (var guideId in dto.GuideIds)
            {
                // Skip invalid guide IDs
                if (guideId <= 0) continue;

                Console.WriteLine($"Adding user {userId} to guide {guideId}");
                await _guideUserRepository.AddAsync(new GuideUser
                {
                    UserId = userId,
                    GuideId = guideId
                });
            }
        }

        return (true, null);
    }
}