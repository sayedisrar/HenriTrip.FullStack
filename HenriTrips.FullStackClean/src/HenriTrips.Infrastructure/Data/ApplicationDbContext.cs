using HenriTrips.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HenriTrips.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Guide> Guides { get; set; } = null!;
        public DbSet<Activity> Activities { get; set; } = null!;
        public DbSet<GuideUser> GuideUsers { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<GuideUser>()
                .HasKey(x => new { x.UserId, x.GuideId });

            builder.Entity<GuideUser>()
                .HasOne(gu => gu.Guide)
                .WithMany(g => g.GuideUsers)
                .HasForeignKey(gu => gu.GuideId);
        }
    }
}