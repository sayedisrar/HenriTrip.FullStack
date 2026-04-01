using HenriTrips.Api.Entities;

namespace HenriTrips.Api.Entities
{
    public class Guide
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int Days { get; set; }

        public string Mobility { get; set; } = null!; // car, bike, etc.
        public string Season { get; set; } = null!;   // summer, winter
        public string ForWho { get; set; } = null!;   // family, solo

        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
        public ICollection<GuideUser> GuideUsers { get; set; } = new List<GuideUser>();
    }
}