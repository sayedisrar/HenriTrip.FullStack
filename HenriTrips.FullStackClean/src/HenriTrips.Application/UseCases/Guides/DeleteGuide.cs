using HenriTrips.Application.Interfaces;

namespace HenriTrips.Application.UseCases.Guides;

public class DeleteGuide
{
    private readonly IGuideRepository _repo;

    public DeleteGuide(IGuideRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> ExecuteAsync(int id)
    {
        var guide = await _repo.GetByIdAsync(id);
        if (guide == null) return false;

        await _repo.DeleteAsync(id);
        return true;
    }
}