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