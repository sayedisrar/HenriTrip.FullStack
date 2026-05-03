using HenriTrips.Application.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Application.UseCases.Guides;

public class RemoveUserFromGuide
{
    private readonly IGuideRepository _guideRepository;

    public RemoveUserFromGuide(IGuideRepository guideRepository)
    {
        _guideRepository = guideRepository;
    }

    public async Task<bool> ExecuteAsync(int guideId, string userId)
    {
        return await _guideRepository.RemoveUserFromGuideAsync(userId, guideId);
    }
}
