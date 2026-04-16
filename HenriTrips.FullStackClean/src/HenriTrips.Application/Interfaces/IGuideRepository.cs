using HenriTrips.Domain.Entities;

namespace HenriTrips.Application.Interfaces;

public interface IGuideRepository
{
    Task<List<Guide>> GetAllAsync();
    Task<Guide?> GetByIdAsync(int id);
    Task AddAsync(Guide guide);
    Task UpdateAsync(Guide guide);
    Task DeleteAsync(int id);
}
