using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Api.Entities
{
    public class GuideUser
    {
        public int GuideId { get; set; }
        public Guide Guide { get; set; } = null!;

        public string UserId { get; set; } = null!;
        public IdentityUser User { get; set; } = null!;  // Change this to IdentityUser
    }
}
//namespace HenriTrips.Api.Entities
//{
//    public class GuideUser
//    {
//        public int GuideId { get; set; }
//        public Guide Guide { get; set; } = null!;

//        public string UserId { get; set; } = null!;
//        public User User { get; set; } = null!;  // Now using custom User class
//    }
//}