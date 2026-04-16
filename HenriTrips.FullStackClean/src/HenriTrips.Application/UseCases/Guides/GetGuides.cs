using HenriTrips.Application.Interfaces;
using HenriTrips.Domain.Entities;

namespace HenriTrips.Application.UseCases.Guides;

public class GetGuides
{
    private readonly IGuideRepository _repo;

    public GetGuides(IGuideRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<Guide>> ExecuteAsync()
    {
        return await _repo.GetAllAsync();
    }
}
