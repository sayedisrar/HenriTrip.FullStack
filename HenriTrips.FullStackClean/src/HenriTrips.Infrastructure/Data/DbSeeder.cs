using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace HenriTrips.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAdminAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        // Create BOTH roles if they don't exist
        string[] roles = { "Admin", "User" };

        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
                Console.WriteLine($"Created role: {roleName}");
            }
        }

        const string adminEmail = "admin@henritrips.com";
        const string adminPassword = "Admin@12345!";

        // Create admin user if not exists
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            adminUser = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
                Console.WriteLine("Created admin user");
            }
            else
            {
                Console.WriteLine("Failed to create admin user: " + string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            // Ensure existing admin user has Admin role
            var isAdmin = await userManager.IsInRoleAsync(adminUser, "Admin");
            if (!isAdmin)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
                Console.WriteLine("Added Admin role to existing admin user");
            }
        }
    }
}