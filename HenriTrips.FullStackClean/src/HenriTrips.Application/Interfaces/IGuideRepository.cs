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
