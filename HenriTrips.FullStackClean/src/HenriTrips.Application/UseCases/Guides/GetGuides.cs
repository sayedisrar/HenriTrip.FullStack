using HenriTrips.Application.DTOs.Activity;
using HenriTrips.Application.DTOs.Guide;
using HenriTrips.Application.Interfaces;


namespace HenriTrips.Application.UseCases.Guides
{
    public class GetGuides
    {
        private readonly IGuideRepository _repo;

        public GetGuides(IGuideRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<GuideResponseDto>> ExecuteAsync()
        {
            var guides = await _repo.GetAllAsync();

            return guides.Select(g => new GuideResponseDto
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
            }).ToList();
        }
    }

}