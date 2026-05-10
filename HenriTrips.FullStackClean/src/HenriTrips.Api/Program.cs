using FluentValidation;
using FluentValidation.AspNetCore;
using HenriTrips.Api.Middleware;
using HenriTrips.Application.Interfaces;
using HenriTrips.Application.UseCases.Activities;
using HenriTrips.Application.UseCases.Auth.Users;
using HenriTrips.Application.UseCases.Guides;
using HenriTrips.Application.Validators.Guide;
using HenriTrips.Infrastructure.Data;
using HenriTrips.Infrastructure.Identity;
using HenriTrips.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

#region ENVIRONMENT FLAG
var isTesting = builder.Environment.IsEnvironment("Testing");
#endregion

#region CONNECTION STRING
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Missing DefaultConnection string");
#endregion

#region CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
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

#region JWT AUTHENTICATION (🔥 FIX)
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrEmpty(secretKey))
    throw new Exception("JWT SecretKey is missing!");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKey)
        )
    };
});
#endregion

#region DISABLE COOKIE REDIRECT (🔥 VERY IMPORTANT)
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});
#endregion

#region SERVICES
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<TokenService>();

builder.Services.AddScoped<IGuideRepository, GuideRepository>();
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<IGuideUserRepository, GuideUserRepository>();

#endregion

#region USE CASES
// Guides
builder.Services.AddScoped<GetGuides>();
builder.Services.AddScoped<GetGuideById>();
builder.Services.AddScoped<CreateGuide>();
builder.Services.AddScoped<UpdateGuide>();
builder.Services.AddScoped<DeleteGuide>();
builder.Services.AddScoped<InviteUser>();

// Activities
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

#region User Management Use Cases
builder.Services.AddScoped<GetAllUsers>();
builder.Services.AddScoped<GetUserById>();
builder.Services.AddScoped<CreateUser>();
builder.Services.AddScoped<UpdateUser>();
builder.Services.AddScoped<DeleteUser>();

#endregion

#region Guide Permission Use Cases
builder.Services.AddScoped<GetUserInvitedGuides>();
builder.Services.AddScoped<RemoveUserFromGuide>();
#endregion

#region LOGGING
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);
#endregion



var app = builder.Build();

#region MIGRATION + SEED
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var db = services.GetRequiredService<ApplicationDbContext>();

        if (!isTesting)
        {
            var pendingMigrations = await db.Database.GetPendingMigrationsAsync();

            if (pendingMigrations.Any())
            {
                await db.Database.MigrateAsync();
                logger.LogInformation("Database migrations applied.");
            }

            await DbSeeder.SeedAdminAsync(services);
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Migration or seeding failed");
    }
}
#endregion

#region MIDDLEWARE

app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

if (!app.Environment.IsEnvironment("Docker"))
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAngular");

// 🔥 ORDER MATTERS
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok("Healthy"));

#endregion

app.Run();

// Required for testing
public partial class Program { }