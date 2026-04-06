using HenriTrips.Api.Data;
using HenriTrips.Api.DTOs.Activity;
using HenriTrips.Api.DTOs.Guide;
using HenriTrips.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HenriTrips.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GuidesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public GuidesController(ApplicationDbContext context, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/guides
        [HttpGet]
        public async Task<IActionResult> GetGuides()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");

            IQueryable<Guide> guidesQuery;

            if (isAdmin)
            {
                guidesQuery = _context.Guides
                    .Include(g => g.Activities)
                    .Include(g => g.GuideUsers);
            }
            else
            {
                guidesQuery = _context.Guides
                    .Where(g => g.GuideUsers.Any(gu => gu.UserId == userId))
                    .Include(g => g.Activities);
            }

            var guides = await guidesQuery
                .Select(g => new GuideResponseDto
                {
                    Id = g.Id,
                    Title = g.Title,
                    Description = g.Description,
                    Days = g.Days,
                    Mobility = g.Mobility,
                    Season = g.Season,
                    ForWho = g.ForWho,
                    Activities = g.Activities
                        .OrderBy(a => a.Day)
                        .ThenBy(a => a.Order)
                        .Select(a => new ActivityResponseDto
                        {
                            Id = a.Id,
                            Title = a.Title,
                            Description = a.Description,
                            CategoryCategory = (int)a.CategoryCategory,
                            Address = a.Address,
                            Phone = a.Phone,
                            Schedule = a.Schedule,
                            Website = a.Website,
                            Order = a.Order,
                            Day = a.Day
                        }).ToList()
                })
                .ToListAsync();

            return Ok(guides);
        }

        // GET: api/guides/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGuide(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");

            var guide = await _context.Guides
                .Include(g => g.Activities)
                .Include(g => g.GuideUsers)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (guide == null)
                return NotFound();

            if (!isAdmin && !guide.GuideUsers.Any(gu => gu.UserId == userId))
                return Forbid();

            var guideDto = new GuideResponseDto
            {
                Id = guide.Id,
                Title = guide.Title,
                Description = guide.Description,
                Days = guide.Days,
                Mobility = guide.Mobility,
                Season = guide.Season,
                ForWho = guide.ForWho,
                Activities = guide.Activities
                    .OrderBy(a => a.Day)
                    .ThenBy(a => a.Order)
                    .Select(a => new ActivityResponseDto
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Description = a.Description,
                        CategoryCategory = (int)a.CategoryCategory,
                        Address = a.Address,
                        Phone = a.Phone,
                        Schedule = a.Schedule,
                        Website = a.Website,
                        Order = a.Order,
                        Day = a.Day
                    }).ToList()
            };

            return Ok(guideDto);
        }

        // POST: api/guides
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateGuide(GuideCreateDto dto)
        {
            var guide = new Guide
            {
                Title = dto.Title,
                Description = dto.Description,
                Days = dto.Days,
                Mobility = dto.Mobility,
                Season = dto.Season,
                ForWho = dto.ForWho
            };

            _context.Guides.Add(guide);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGuide), new { id = guide.Id }, guide);
        }

        // PUT: api/guides/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGuide(int id, GuideUpdateDto dto)
        {
            var guide = await _context.Guides.FindAsync(id);
            if (guide == null)
                return NotFound();

            guide.Title = dto.Title;
            guide.Description = dto.Description;
            guide.Days = dto.Days;
            guide.Mobility = dto.Mobility;
            guide.Season = dto.Season;
            guide.ForWho = dto.ForWho;

            await _context.SaveChangesAsync();
            return Ok(guide);
        }

        // DELETE: api/guides/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGuide(int id)
        {
            var guide = await _context.Guides
                .Include(g => g.Activities)
                .Include(g => g.GuideUsers)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (guide == null)
                return NotFound();

            _context.Activities.RemoveRange(guide.Activities);
            _context.GuideUsers.RemoveRange(guide.GuideUsers);
            _context.Guides.Remove(guide);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Guide deleted successfully" });
        }

        // POST: api/guides/{guideId}/invite-user/{userId}
        [Authorize(Roles = "Admin")]
        [HttpPost("{guideId}/invite-user/{userId}")]
        public async Task<IActionResult> InviteUserToGuide(int guideId, string userId)
        {
            var guide = await _context.Guides.FindAsync(guideId);
            if (guide == null)
                return NotFound("Guide not found");

            var existingInvite = await _context.GuideUsers
                .FirstOrDefaultAsync(gu => gu.GuideId == guideId && gu.UserId == userId);

            if (existingInvite != null)
                return BadRequest("User already invited to this guide");

            var guideUser = new GuideUser
            {
                GuideId = guideId,
                UserId = userId
            };

            _context.GuideUsers.Add(guideUser);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "User invited successfully" });
        }

        // DELETE: api/guides/{guideId}/remove-user/{userId}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{guideId}/remove-user/{userId}")]
        public async Task<IActionResult> RemoveUserFromGuide(int guideId, string userId)
        {
            var guideUser = await _context.GuideUsers
                .FirstOrDefaultAsync(gu => gu.GuideId == guideId && gu.UserId == userId);

            if (guideUser == null)
                return NotFound("User not invited to this guide");

            _context.GuideUsers.Remove(guideUser);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "User removed from guide" });
        }

        // ========== ACTIVITY ENDPOINTS (FIXED - RETURN DTOs) ==========

        // POST: api/guides/activity
        [Authorize(Roles = "Admin")]
        [HttpPost("activity")]
        public async Task<IActionResult> AddActivity(ActivityCreateDto dto)
        {
            var guide = await _context.Guides.FindAsync(dto.GuideId);
            if (guide == null)
                return NotFound("Guide not found");

            var activity = new Activity
            {
                Title = dto.Title,
                Description = dto.Description,
                CategoryCategory = dto.CategoryCategory,
                Address = dto.Address,
                Phone = dto.Phone,
                Schedule = dto.Schedule,
                Website = dto.Website,
                Order = dto.Order,
                Day = dto.Day,
                GuideId = dto.GuideId
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            // Return DTO without circular reference
            return Ok(new ActivityResponseDto
            {
                Id = activity.Id,
                Title = activity.Title,
                Description = activity.Description,
                CategoryCategory = (int)activity.CategoryCategory,
                Address = activity.Address,
                Phone = activity.Phone,
                Schedule = activity.Schedule,
                Website = activity.Website,
                Order = activity.Order,
                Day = activity.Day
            });
        }

        // PUT: api/guides/activity/{activityId}
        [Authorize(Roles = "Admin")]
        [HttpPut("activity/{activityId}")]
        public async Task<IActionResult> UpdateActivity(int activityId, ActivityCreateDto dto)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null)
                return NotFound();

            activity.Title = dto.Title;
            activity.Description = dto.Description;
            activity.CategoryCategory = dto.CategoryCategory;
            activity.Address = dto.Address;
            activity.Phone = dto.Phone;
            activity.Schedule = dto.Schedule;
            activity.Website = dto.Website;
            activity.Order = dto.Order;
            activity.Day = dto.Day;

            await _context.SaveChangesAsync();

            // Return DTO without circular reference
            return Ok(new ActivityResponseDto
            {
                Id = activity.Id,
                Title = activity.Title,
                Description = activity.Description,
                CategoryCategory = (int)activity.CategoryCategory,
                Address = activity.Address,
                Phone = activity.Phone,
                Schedule = activity.Schedule,
                Website = activity.Website,
                Order = activity.Order,
                Day = activity.Day
            });
        }

        // DELETE: api/guides/activity/{activityId}
        [Authorize(Roles = "Admin")]
        [HttpDelete("activity/{activityId}")]
        public async Task<IActionResult> DeleteActivity(int activityId)
        {
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null)
                return NotFound();

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Activity deleted successfully" });
        }

        // ========== HELPER ENDPOINTS ==========

        // GET: api/guides/user/{userId}/invited-guides
        [Authorize(Roles = "Admin")]
        [HttpGet("user/{userId}/invited-guides")]
        public async Task<IActionResult> GetUserInvitedGuides(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            var invitedGuideIds = await _context.GuideUsers
                .Where(gu => gu.UserId == userId)
                .Select(gu => gu.GuideId.ToString())
                .ToListAsync();
            return Ok(invitedGuideIds);
        }

        // GET: api/guides/{guideId}/activities
        [HttpGet("{guideId}/activities")]
        public async Task<IActionResult> GetActivitiesByGuideId(int guideId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");

            // Check if user has access to this guide
            var guide = await _context.Guides
                .Include(g => g.GuideUsers)
                .FirstOrDefaultAsync(g => g.Id == guideId);

            if (guide == null)
                return NotFound("Guide not found");

            if (!isAdmin && !guide.GuideUsers.Any(gu => gu.UserId == userId))
                return Forbid();

            var activities = await _context.Activities
                .Where(a => a.GuideId == guideId)
                .OrderBy(a => a.Day)
                .ThenBy(a => a.Order)
                .Select(a => new ActivityResponseDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    CategoryCategory = (int)a.CategoryCategory,
                    Address = a.Address,
                    Phone = a.Phone,
                    Schedule = a.Schedule,
                    Website = a.Website,
                    Order = a.Order,
                    Day = a.Day
                })
                .ToListAsync();

            return Ok(activities);
        }

        // GET: api/guides/{guideId}/activities/day/{day}
        [HttpGet("{guideId}/activities/day/{day}")]
        public async Task<IActionResult> GetActivitiesByGuideIdAndDay(int guideId, int day)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");

            // Check if user has access to this guide
            var guide = await _context.Guides
                .Include(g => g.GuideUsers)
                .FirstOrDefaultAsync(g => g.Id == guideId);

            if (guide == null)
                return NotFound("Guide not found");

            if (!isAdmin && !guide.GuideUsers.Any(gu => gu.UserId == userId))
                return Forbid();

            var activities = await _context.Activities
                .Where(a => a.GuideId == guideId && a.Day == day)
                .OrderBy(a => a.Order)
                .Select(a => new ActivityResponseDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    CategoryCategory = (int)a.CategoryCategory,
                    Address = a.Address,
                    Phone = a.Phone,
                    Schedule = a.Schedule,
                    Website = a.Website,
                    Order = a.Order,
                    Day = a.Day
                })
                .ToListAsync();

            return Ok(activities);
        }
    }
}