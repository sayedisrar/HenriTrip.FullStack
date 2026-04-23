using HenriTrips.Application.Interfaces;

namespace HenriTrips.Application.UseCases.Activities;

public class DeleteActivity
{
    private readonly IActivityRepository _repo;

    public DeleteActivity(IActivityRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> ExecuteAsync(int id)
    {
        var activity = await _repo.GetByIdAsync(id);
        if (activity == null) return false;

        await _repo.DeleteAsync(id);
        return true;
  











  }

}

