using Microsoft.AspNetCore.Identity;
using HenriTrips.Application.DTOs.Auth;
using HenriTrips.Domain.Entities;
using HenriTrips.Application.Interfaces;

namespace HenriTrips.Application.UseCases.Auth.Users;

public class CreateUser
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IGuideUserRepository _guideUserRepository;

    public CreateUser(
        UserManager<IdentityUser> userManager,
        IGuideUserRepository guideUserRepository)
    {
        _userManager = userManager;
        _guideUserRepository = guideUserRepository;
    }

    public async Task<(bool Success, string? Error, string? UserId)> ExecuteAsync(CreateUserDto dto)
    {
        var user = new IdentityUser
        {
            UserName = dto.Email,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return (false, string.Join(", ", result.Errors.Select(e => e.Description)), null);
        }

        await _userManager.AddToRoleAsync(user, dto.Role);

        // ✅ FIX: Save multiple guide invitations
        if (dto.GuideIds != null && dto.GuideIds.Any())
        {
            foreach (var guideId in dto.GuideIds)
            {
                await _guideUserRepository.AddAsync(new GuideUser
                {
                    UserId = user.Id,
                    GuideId = guideId
                });
            }
        }

        return (true, null, user.Id);
    }
}