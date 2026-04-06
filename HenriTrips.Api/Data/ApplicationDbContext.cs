using HenriTrips.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HenriTrips.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>   
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
                .HasOne(gu => gu.User)
                .WithMany()  // IdentityUser doesn't have GuideUsers navigation
                .HasForeignKey(gu => gu.UserId);

            builder.Entity<GuideUser>()
                .HasOne(gu => gu.Guide)
                .WithMany(g => g.GuideUsers)
                .HasForeignKey(gu => gu.GuideId);
        }
    }
}
//using HenriTrips.Api.Entities;
 //using Microsoft.AspNetCore.Identity;
 //using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
 //using Microsoft.EntityFrameworkCore;

//namespace HenriTrips.Api.Data
//{
//    public class ApplicationDbContext : IdentityDbContext<IdentityUser>  // ✅ Use IdentityUser
//    {
//        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
//            : base(options)
//        {
//        }

//        public DbSet<Guide> Guides { get; set; } = null!;
//        public DbSet<Activity> Activities { get; set; } = null!;
//        public DbSet<GuideUser> GuideUsers { get; set; } = null!;

//        protected override void OnModelCreating(ModelBuilder builder)
//        {
//            base.OnModelCreating(builder);

//            builder.Entity<GuideUser>()
//                .HasKey(x => new { x.UserId, x.GuideId });

//            builder.Entity<GuideUser>()
//                .HasOne(gu => gu.User)
//                .WithMany()  // IdentityUser doesn't have GuideUsers navigation property
//                .HasForeignKey(gu => gu.UserId);

//            builder.Entity<GuideUser>()
//                .HasOne(gu => gu.Guide)
//                .WithMany(g => g.GuideUsers)
//                .HasForeignKey(gu => gu.GuideId);
//        }
//    }
//}