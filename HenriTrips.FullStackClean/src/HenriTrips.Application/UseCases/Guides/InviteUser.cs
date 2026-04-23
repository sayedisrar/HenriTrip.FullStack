using HenriTrips.Application.Interfaces;

namespace HenriTrips.Application.UseCases.Guides;

public class InviteUser
{
    private readonly IGuideRepository _repo;

    public InviteUser(IGuideRepository repo)
    {
        _repo = repo;
    }

    public async Task ExecuteAsync(int guideId, string userId)
    {
        await _repo.AddUserToGuide(userId, guideId);
    }
}