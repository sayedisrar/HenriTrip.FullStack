using HenriTrips.Application.DTOs.Activity;
using HenriTrips.Application.Interfaces;

namespace HenriTrips.Application.UseCases.Activities;

public class UpdateActivity
{
    private readonly IActivityRepository _repo;

    public UpdateActivity(IActivityRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> ExecuteAsync(int id, ActivityUpdateDto dto)
    {
        var activity = await _repo.GetByIdAsync(id);
        if (activity == null) return false;

        activity.Title = dto.Title;
        activity.Description = dto.Description;
        activity.CategoryCategory = dto.CategoryCategory;
        activity.Address = dto.Address;
        activity.Phone = dto.Phone;
        activity.Schedule = dto.Schedule;
        activity.Website = dto.Website;
        activity.Order = dto.Order;
        activity.Day = dto.Day;

        await _repo.UpdateAsync(activity);
        return true;
    }
}