using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Api.Entities
{
    public class GuideUser
    {
        public string UserId { get; set; } = null!;
        public IdentityUser User { get; set; } = null!;

        public int GuideId { get; set; }
        public Guide Guide { get; set; } = null!;
    }
}
