//using Microsoft.AspNetCore.Identity;

//namespace HenriTrips.Api.Entities
//{
//    public class User
//    {
//    }
//}


using Microsoft.AspNetCore.Identity;

namespace HenriTrips.Api.Entities
{
    public class User : IdentityUser
    {
        // Add any custom properties you need
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        // Navigation property
        public virtual ICollection<GuideUser> GuideUsers { get; set; } = new List<GuideUser>();
    }
}
