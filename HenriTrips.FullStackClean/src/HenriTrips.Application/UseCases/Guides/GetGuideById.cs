using HenriTrips.Application.DTOs.Activity;
using HenriTrips.Application.DTOs.Guide;
using HenriTrips.Application.Interfaces;

namespace HenriTrips.Application.UseCases.Guides;

public class GetGuideById
{
    private readonly IGuideRepository _repo;

    public GetGuideById(IGuideRepository repo)
    {
        _repo = repo;
    }

    public async Task<GuideResponseDto?> ExecuteAsync(int id)
    {
        var g = await _repo.GetByIdAsync(id);
        if (g == null) return null;

        return new GuideResponseDto
        {
            Id = g.Id,
            Title = g.Title,
            Description = g.Description,
            Days = g.Days,
            Mobility = g.Mobility,
            Season = g.Season,
            ForWho = g.ForWho,
            Activities = g.Activities.Select(a => new ActivityResponseDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                CategoryCategory = (int)a.CategoryCategory,
                Address = a.Address,
                Phone = a.Phone,
                Schedule = a.Schedule,
                Website = a.Website,
                Order = a.Order,
                Day = a.Day
            }).ToList()
        };
    }
}