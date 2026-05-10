using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using HenriTrips.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace HenriTrips.IntegrationTests.Helpers;

public class CustomWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public HttpClient Client { get; private set; } = null!;
    public new IServiceProvider Services { get; private set; } = null!;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // Remove existing DbContext
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Add In-Memory Database for testing (skip migrations)
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid().ToString());
            });

            // Remove the hosted service that runs migrations
            var migrationService = services.FirstOrDefault(d => d.ServiceType.Name.Contains("DbMigrator") ||
                                                                  d.ServiceType.Name.Contains("Migration"));
            if (migrationService != null)
                services.Remove(migrationService);
        });

        // Skip migration and seeding during tests
        builder.UseEnvironment("Testing");
    }

    public async Task<string?> GetAuthTokenAsync(HttpClient client)
    {
        var loginDto = new { Email = "admin@henritrips.com", Password = "Admin@12345!" };
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(loginDto),
            System.Text.Encoding.UTF8, "application/json");

        var response = await client.PostAsync("/api/Auth/login", content);
        if (!response.IsSuccessStatusCode)
            return null;

        var responseString = await response.Content.ReadAsStringAsync();
        var json = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(responseString);

        if (json.TryGetProperty("data", out var dataProperty))
            return dataProperty.GetString();

        if (json.TryGetProperty("Data", out var dataProperty2))
            return dataProperty2.GetString();

        return null;
    }

    public async Task AuthenticateAsAdminAsync(HttpClient client)
    {
        var token = await GetAuthTokenAsync(client);
        if (!string.IsNullOrEmpty(token))
        {
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }
    }

    public async Task InitializeAsync()
    {
        Client = CreateClient();
        Services = base.Services;

        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.EnsureCreatedAsync();

        // Seed test data
        await SeedTestDataAsync(dbContext);
    }

    private static async Task SeedTestDataAsync(ApplicationDbContext dbContext)
    {
        if (!dbContext.Guides.Any())
        {
            dbContext.Guides.Add(new Domain.Entities.Guide
            {
                Id = 1,
                Title = "Test Guide",
                Description = "Test Description",
                Days = 3,
                Mobility = "car",
                Season = "summer",
                ForWho = "family"
            });
            await dbContext.SaveChangesAsync();
        }
    }

    public new async Task DisposeAsync()
    {
        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.EnsureDeletedAsync();
    }
}