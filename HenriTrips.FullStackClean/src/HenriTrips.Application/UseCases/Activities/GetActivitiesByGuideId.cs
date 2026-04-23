using HenriTrips.Application.DTOs.Activity;
using HenriTrips.Application.Interfaces;

namespace HenriTrips.Application.UseCases.Activities;

public class GetActivitiesByGuideId
{
    private readonly IActivityRepository _repo;

    public GetActivitiesByGuideId(IActivityRepository repo)
    {
        _repo = repo;
   }

    public async Task<List<ActivityResponseDto>> ExecuteAsync(int guideId)
    {
        var activities = await _repo.GetByGuideIdAsync(guideId);

        return activities.Select(a => new ActivityResponseDto
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
        }).ToList();
  


















  }

}

