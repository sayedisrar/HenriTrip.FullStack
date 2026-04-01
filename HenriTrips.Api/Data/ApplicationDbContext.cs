using HenriTrips.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

 
namespace HenriTrips.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser, IdentityRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Guide> Guides { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<GuideUser> GuideUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            
            builder.Entity<GuideUser>()
                .HasKey(x => new { x.UserId, x.GuideId });

            // Optional but professional (recommended)
            builder.Entity<GuideUser>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId);

            builder.Entity<GuideUser>()
                .HasOne(x => x.Guide)
                .WithMany(g => g.GuideUsers)
                .HasForeignKey(x => x.GuideId);
        }
    }
}