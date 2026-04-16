namespace HenriTrips.Domain.Entities
{
    public class Guide
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int Days { get; set; }
        public string Mobility { get; set; } = null!;
        public string Season { get; set; } = null!;
        public string ForWho { get; set; } = null!;

        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
        public ICollection<GuideUser> GuideUsers { get; set; } = new List<GuideUser>();
    }
}
