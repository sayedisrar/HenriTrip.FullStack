using HenriTrips.Application.Interfaces;
using HenriTrips.Domain.Entities;
using HenriTrips.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HenriTrips.Infrastructure.Repositories;

public class GuideRepository : IGuideRepository
{
    private readonly ApplicationDbContext _context;

    public GuideRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Guide>> GetAllAsync()
    {
        return await _context.Guides
            .Include(g => g.Activities)
            .ToListAsync();
    }

    public async Task<Guide?> GetByIdAsync(int id)
    {
        return await _context.Guides
            .Include(g => g.Activities)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task AddAsync(Guide guide)
    {
        await _context.Guides.AddAsync(guide);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Guide guide)
    {
        _context.Guides.Update(guide);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var guide = await _context.Guides.FindAsync(id);
        if (guide != null)
        {
            _context.Guides.Remove(guide);
            await _context.SaveChangesAsync();
        }
    }
    public async Task AddUserToGuide(string userId, int guideId)
    {
        _context.GuideUsers.Add(new GuideUser
        {
            UserId = userId,
            GuideId = guideId
        });

        await _context.SaveChangesAsync();
    }
}
