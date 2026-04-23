using HenriTrips.Application.DTOs.Guide;
using HenriTrips.Application.Interfaces;
using HenriTrips.Domain.Entities;

namespace HenriTrips.Application.UseCases.Guides;

public class CreateGuide
{
    private readonly IGuideRepository _repo;

    public CreateGuide(IGuideRepository repo)
    {
        _repo = repo;
    }

    public async Task<int> ExecuteAsync(GuideCreateDto dto)
    {
        var guide = new Guide
        {
            Title = dto.Title,
            Description = dto.Description,
            Days = dto.Days,
            Mobility = dto.Mobility,
            Season = dto.Season,
            ForWho = dto.ForWho
        };

        await _repo.AddAsync(guide);
        return guide.Id;
    }
}