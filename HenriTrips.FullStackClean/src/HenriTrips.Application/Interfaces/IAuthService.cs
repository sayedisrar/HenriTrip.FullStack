using System;
using System.Collections.Generic;
using System.Text;

namespace HenriTrips.Application.Interfaces;

public interface IAuthService
{
    Task<string> LoginAsync(string email, string password);
    Task<bool> RegisterAsync(string email, string password);
}
using HenriTrips.Domain.Entities;

namespace HenriTrips.Application.Interfaces;

public interface IGuideRepository
{
    Task<List<Guide>> GetAllAsync();
    Task<Guide?> GetByIdAsync(int id);
    Task AddAsync(Guide guide);
    Task UpdateAsync(Guide guide);
    Task DeleteAsync(int id);
    
    Task AddUserToGuide(string userId, int guideId);

    // NEW METHODS
    Task<List<string>> GetUserInvitedGuideIdsAsync(string userId);
    Task<bool> RemoveUserFromGuideAsync(string userId, int guideId);
    Task<List<Guide>> GetGuidesByUserIdAsync(string userId);
}
using HenriTrips.Domain.Entities;

namespace HenriTrips.Application.Interfaces;

public interface IGuideUserRepository
{
    Task AddAsync(GuideUser guideUser);

    Task<bool> ExistsAsync(string userId, int guideId);

    Task AssignUserToGuide(string userId, int guideId);

    Task RemoveUserFromGuide(string userId, int guideId);
    Task RemoveAllUserGuides(string userId);

    Task RemoveAllUserGuidesAsync(string userId);
    Task<List<string>> GetUserGuideIdsAsync(string userId);
}