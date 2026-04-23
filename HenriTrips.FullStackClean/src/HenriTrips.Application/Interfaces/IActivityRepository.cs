using HenriTrips.Domain.Entities;

namespace HenriTrips.Application.Interfaces;

public interface IActivityRepository
{
    Task<List<Activity>> GetByGuideIdAsync(int guideId);
    Task AddAsync(Activity activity);
    Task UpdateAsync(Activity activity);
    Task DeleteAsync(int id);
    Task<Activity?> GetByIdAsync(int id);
}
