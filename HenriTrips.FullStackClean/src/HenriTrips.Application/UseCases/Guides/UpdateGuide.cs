using HenriTrips.Application.DTOs.Guide;
using HenriTrips.Application.Interfaces;

namespace HenriTrips.Application.UseCases.Guides;

public class UpdateGuide
{
    private readonly IGuideRepository _repo;

    public UpdateGuide(IGuideRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> ExecuteAsync(int id, GuideUpdateDto dto)
    {
        var guide = await _repo.GetByIdAsync(id);
        if (guide == null) return false;

        guide.Title = dto.Title;
        guide.Description = dto.Description;
        guide.Days = dto.Days;
        guide.Mobility = dto.Mobility;
        guide.Season = dto.Season;
        guide.ForWho = dto.ForWho;

        await _repo.UpdateAsync(guide);
        return true;
    }
}