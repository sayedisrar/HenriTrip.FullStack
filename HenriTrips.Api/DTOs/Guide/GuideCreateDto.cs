namespace HenriTrips.Api.DTOs.Guide
{
    public class GuideCreateDto
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int Days { get; set; }
        public string Mobility { get; set; } = null!;
        public string Season { get; set; } = null!;
        public string ForWho { get; set; } = null!;
    }
}