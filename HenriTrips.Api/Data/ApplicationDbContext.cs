using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HenriTrips.Api.Data
{
    // ApplicationDbContext inherits IdentityDbContext to manage all Identity tables
    public class ApplicationDbContext : IdentityDbContext<IdentityUser, IdentityRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
 


        // TODO: Add your other entities here when ready
        // Example:
        // public DbSet<Guide> Guides { get; set; }
        // public DbSet<Activity> Activities { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // You can customize Identity table names or relationships here if needed
            // Example: rename Identity tables
            // builder.Entity<IdentityUser>(b => { b.ToTable("Users"); });
        }
    }
}

//using HenriTrips.Api.Entities;

//using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore;

//namespace HenriTrips.Api.Data
//{
//    public class ApplicationDbContext : IdentityDbContext<User, Microsoft.AspNetCore.Identity.IdentityRole<int>, int>
//    {
//        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
//            : base(options)
//        {
//        }

//        // Leave OnModelCreating empty for now; wizard will handle Identity scaffolding
//        protected override void OnModelCreating(ModelBuilder builder)
//        {
//            base.OnModelCreating(builder);
//        }
//    }
//}