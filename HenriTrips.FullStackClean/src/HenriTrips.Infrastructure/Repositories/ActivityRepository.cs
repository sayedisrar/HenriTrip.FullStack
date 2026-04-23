using HenriTrips.Application.Interfaces;
using HenriTrips.Domain.Entities;
using HenriTrips.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HenriTrips.Infrastructure.Repositories;

public class ActivityRepository : IActivityRepository
{
    private readonly ApplicationDbContext _context;

    public ActivityRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Activity activity)
    {
        await _context.Activities.AddAsync(activity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Activity activity)
    {
        _context.Activities.Update(activity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var activity = await _context.Activities.FindAsync(id);
        if (activity != null)
        {
            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Activity?> GetByIdAsync(int id)
    {
        return await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<List<Activity>> GetByGuideIdAsync(int guideId)
    {
        return await _context.Activities
            .Where(a => a.GuideId == guideId)
            .ToListAsync();
    }
}