using HenriTrips.Application.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Application.UseCases.Guides;

public class GetUserInvitedGuides
{
    private readonly IGuideRepository _guideRepository;

    public GetUserInvitedGuides(IGuideRepository guideRepository)
    {
        _guideRepository = guideRepository;
    }

    public async Task<List<string>> ExecuteAsync(string userId)
    {
        var guideIds = await _guideRepository.GetUserInvitedGuideIdsAsync(userId);
        Console.WriteLine($"GetUserInvitedGuides for user {userId}: found {guideIds.Count} guides");
        return guideIds;
    }
}
