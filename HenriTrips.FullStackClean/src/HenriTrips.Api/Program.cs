using FluentValidation;
using FluentValidation.AspNetCore;
using HenriTrips.Api.Middleware;
using HenriTrips.Application.Interfaces;
using HenriTrips.Application.UseCases.Activities;
using HenriTrips.Application.UseCases.Guides;
using HenriTrips.Application.Validators.Guide;
using HenriTrips.Infrastructure.Data;
using HenriTrips.Infrastructure.Identity;
using HenriTrips.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

#region ENVIRONMENT FLAG (TEST SAFETY)
var isTesting = builder.Environment.IsEnvironment("Testing");
#endregion

#region CONNECTION STRING
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Missing DefaultConnection string");
#endregion

#region DB CONTEXT
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});
#endregion

#region IDENTITY
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
#endregion

#region AUTH SERVICE
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<TokenService>();
#endregion

#region REPOSITORIES
builder.Services.AddScoped<IGuideRepository, GuideRepository>();
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
#endregion

#region USE CASES - GUIDES
builder.Services.AddScoped<GetGuides>();
builder.Services.AddScoped<GetGuideById>();
builder.Services.AddScoped<CreateGuide>();
builder.Services.AddScoped<UpdateGuide>();
builder.Services.AddScoped<DeleteGuide>();
builder.Services.AddScoped<InviteUser>();
#endregion

#region USE CASES - ACTIVITIES
builder.Services.AddScoped<CreateActivity>();
builder.Services.AddScoped<UpdateActivity>();
builder.Services.AddScoped<DeleteActivity>();
builder.Services.AddScoped<GetActivitiesByGuideId>();
#endregion

#region CONTROLLERS + SWAGGER
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
#endregion

#region FLUENT VALIDATION
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining(typeof(GuideCreateDtoValidator));
#endregion

#region LOGGING
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);
#endregion

var app = builder.Build();

#region AUTO MIGRATION + SEED (SAFE FOR EXISTING DB + DOCKER)

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var db = services.GetRequiredService<ApplicationDbContext>();

        if (!isTesting)
        {
            // ✅ 1. Ensure DB exists (safe, does nothing if already exists)
            await db.Database.EnsureCreatedAsync();

            // ✅ 2. Try migrations safely (skip if schema already exists without history)
            try
            {
                var pendingMigrations = await db.Database.GetPendingMigrationsAsync();

                if (pendingMigrations.Any())
                {
                    await db.Database.MigrateAsync();
                    logger.LogInformation("Database migrations applied.");
                }
                else
                {
                    logger.LogInformation("No pending migrations.");
                }
            }
            catch (Exception ex)
            {
                // 🔐 Critical: prevents crash when tables exist but no migration history
                logger.LogWarning("Migration skipped: {Message}", ex.Message);
            }

            // ✅ 3. Safe seeding (should internally check if data already exists)
            await DbSeeder.SeedAdminAsync(services);
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Migration or seeding failed");
    }
}

#endregion

#region MIDDLEWARE PIPELINE
app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check
app.MapGet("/health", () => Results.Ok("Healthy"));
#endregion

app.Run();

// REQUIRED for WebApplicationFactory testing
public partial class Program { }