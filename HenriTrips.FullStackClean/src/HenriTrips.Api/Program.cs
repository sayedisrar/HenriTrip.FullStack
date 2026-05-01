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

#region CORS (ANGULAR SUPPORT)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
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

#region AUTO MIGRATION + SEED (SAFE FOR DEV / DOCKER / PROD)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var db = services.GetRequiredService<ApplicationDbContext>();

        if (!isTesting)
        {
            // Apply migrations safely (DO NOT use EnsureCreated with Migrations)
            var pendingMigrations = await db.Database.GetPendingMigrationsAsync();

            if (pendingMigrations.Any())
            {
                await db.Database.MigrateAsync();
                logger.LogInformation("Database migrations applied.");
            }

            // Seed safely (idempotent inside Seeder)
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

// HTTPS only outside Docker (prevents redirect issues)
if (!app.Environment.IsEnvironment("Docker"))
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check
app.MapGet("/health", () => Results.Ok("Healthy"));

#endregion

app.Run();

// REQUIRED for WebApplicationFactory testing
public partial class Program { }