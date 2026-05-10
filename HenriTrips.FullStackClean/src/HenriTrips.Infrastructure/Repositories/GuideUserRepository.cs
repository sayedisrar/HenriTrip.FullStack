
using HenriTrips.Application.Interfaces;
using HenriTrips.Domain.Entities;
using HenriTrips.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HenriTrips.Infrastructure.Repositories;

public class GuideUserRepository : IGuideUserRepository
{
    private readonly ApplicationDbContext _context;

    public GuideUserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task RemoveAllUserGuides(string userId)
    {
        var userGuides = _context.GuideUsers.Where(x => x.UserId == userId);
        _context.GuideUsers.RemoveRange(userGuides);
        await _context.SaveChangesAsync();
    }
    public async Task AddAsync(GuideUser guideUser)
    {
        _context.GuideUsers.Add(guideUser);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(string userId, int guideId)
    {
        return await _context.GuideUsers
            .AnyAsync(x => x.UserId == userId && x.GuideId == guideId);
    }

    public async Task AssignUserToGuide(string userId, int guideId)
    {
        var exists = await ExistsAsync(userId, guideId);

        if (!exists)
        {
            _context.GuideUsers.Add(new GuideUser
            {
                UserId = userId,
                GuideId = guideId
            });

            await _context.SaveChangesAsync();
        }
    }

    public async Task RemoveUserFromGuide(string userId, int guideId)
    {
        var entity = await _context.GuideUsers
            .FirstOrDefaultAsync(x => x.UserId == userId && x.GuideId == guideId);

        if (entity != null)
        {
            _context.GuideUsers.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemoveAllUserGuidesAsync(string userId)
    {
        var userGuides = _context.GuideUsers.Where(x => x.UserId == userId);
        _context.GuideUsers.RemoveRange(userGuides);
        await _context.SaveChangesAsync();
        Console.WriteLine($"Removed all guide assignments for user {userId}");
    }

    public async Task<List<string>> GetUserGuideIdsAsync(string userId)
    {
        return await _context.GuideUsers
            .Where(x => x.UserId == userId)
            .Select(x => x.GuideId.ToString())
            .ToListAsync();
    }
}