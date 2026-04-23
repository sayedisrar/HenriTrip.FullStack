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

#region CONNECTION STRING
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Missing DefaultConnection string");
#endregion

#region DB CONTEXT
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
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
#endregion

var app = builder.Build();

#region AUTO MIGRATION (CRITICAL FIX FOR DOCKER)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}
#endregion

#region MIDDLEWARE PIPELINE
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ⚠️ IMPORTANT ORDER
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
#endregion

app.Run();