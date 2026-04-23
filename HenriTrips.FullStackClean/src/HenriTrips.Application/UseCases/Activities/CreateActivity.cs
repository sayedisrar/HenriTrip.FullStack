using HenriTrips.Application.DTOs.Activity;
using HenriTrips.Application.Interfaces;
using HenriTrips.Domain.Entities;

namespace HenriTrips.Application.UseCases.Activities;

public class CreateActivity
{
    private readonly IActivityRepository _repo;

    public CreateActivity(IActivityRepository repo)
    {
        _repo = repo;
    }

    public async Task<int> ExecuteAsync(ActivityCreateDto dto)
    {
        var activity = new Activity
        {
            Title = dto.Title,
            Description = dto.Description,
            CategoryCategory = dto.CategoryCategory,
            Address = dto.Address,
            Phone = dto.Phone,
            Schedule = dto.Schedule,
            Website = dto.Website,
            Order = dto.Order,
            Day = dto.Day,
            GuideId = dto.GuideId
        };

        await _repo.AddAsync(activity);
        return activity.Id;
  
























  }

}

