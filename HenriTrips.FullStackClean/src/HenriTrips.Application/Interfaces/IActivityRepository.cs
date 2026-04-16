using HenriTrips.Domain.Entities;

namespace HenriTrips.Application.Interfaces;

public interface IActivityRepository
{
    Task<List<Activity>> GetByGuideIdAsync(int guideId);
}
