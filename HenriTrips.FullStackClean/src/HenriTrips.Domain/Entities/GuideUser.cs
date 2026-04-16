
namespace HenriTrips.Domain.Entities
{
    public class GuideUser
    {
        public int GuideId { get; set; }
        public Guide Guide { get; set; } = null!;

        public string UserId { get; set; } = null!;
    }
}
 