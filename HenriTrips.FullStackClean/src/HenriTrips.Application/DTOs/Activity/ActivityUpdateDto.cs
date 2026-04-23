using HenriTrips.Domain.Enums;

namespace HenriTrips.Application.DTOs.Activity
{
    public class ActivityUpdateDto
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public ActivityCategory CategoryCategory { get; set; }
        public string Address { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Schedule { get; set; } = null!;
        public string Website { get; set; } = null!;
        public int Order { get; set; }
        public int Day { get; set; }
    }
}