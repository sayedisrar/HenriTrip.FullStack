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

    // NEW METHODS
    public async Task




<List<string>> GetUserInvitedGuideIdsAsync(string userId)
    {
        return await _context.GuideUsers
            .Where(gu => gu.UserId == userId)
            .Select(gu => gu.GuideId.ToString())
            .ToListAsync();
   }

    public async Task<bool> RemoveUserFromGuideAsync(string userId, int guideId)
    {
        var guideUser = await _context.GuideUsers
 




           .FirstOrDefaultAsync(gu => gu.UserId == userId && gu.GuideId == guideId);
        
        if (guideUser == null) return false;
        
        _context.GuideUsers.Remove(guideUser);
        await _context.SaveChangesAsync();
        return true;
    }





    public async Task<List<Guide>> GetGuidesByUserIdAsync(string userId)
    {
        return await _context.Guides
            .Where(g => g.GuideUsers.Any(gu => gu.UserId == userId))
            .Include(g => g.Activities)
            .ToListAsync();
    }
    
}
