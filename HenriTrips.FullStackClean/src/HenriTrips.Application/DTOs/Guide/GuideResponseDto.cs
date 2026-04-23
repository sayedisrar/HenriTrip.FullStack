using HenriTrips.Application.DTOs.Activity;

namespace HenriTrips.Application.DTOs.Guide
{
    public class GuideResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int Days { get; set; }
        public string Mobility { get; set; } = null!;
        public string Season { get; set; } = null!;
        public string ForWho { get; set; } = null!;
        public List<ActivityResponseDto> Activities { get; set; } = new();
    }
}
