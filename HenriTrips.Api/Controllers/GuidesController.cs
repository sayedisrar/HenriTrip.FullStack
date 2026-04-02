using HenriTrips.Api.Data;
using HenriTrips.Api.Entities;
using HenriTrips.Api.DTOs.Guide;
using HenriTrips.Api.DTOs.Activity;
using Microsoft.AspNetCore.Authorization;
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

        public GuidesController(ApplicationDbContext context)
        {
            _context = context;
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
                            CategoryCategory = a.CategoryCategory,
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
                        CategoryCategory = a.CategoryCategory,
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

        // Activity endpoints
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

            return Ok(activity);
        }

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
            return Ok(activity);
        }

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
    }
}
//using HenriTrips.Api.Data;
 //using HenriTrips.Api.Entities;
 //using HenriTrips.Api.DTOs.Guide;
 //using HenriTrips.Api.DTOs.Activity;
 //using Microsoft.AspNetCore.Authorization;
 //using Microsoft.AspNetCore.Mvc;
 //using Microsoft.EntityFrameworkCore;
 //using System.Security.Claims;

//namespace HenriTrips.Api.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    [Authorize]
//    public class GuidesController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;

//        public GuidesController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        // GET: api/guides
//        [HttpGet]
//        public async Task<IActionResult> GetGuides()
//        {
//            //var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
//            //if (!int.TryParse(userIdStr, out int userId))
//            //    return Unauthorized("Invalid user");

//            //var isAdmin = User.Identity?.IsAuthenticated == true && User.IsInRole("Admin");

//            //var guidesQuery = isAdmin
//            //    ? _context.Guides.Include(g => g.Activities)
//            //    : _context.Guides
//            //        .Where(g => g.GuideUsers.Any(u => u.UserId == userId))
//            //        .Include(g => g.Activities);

//            //var guides = await guidesQuery
//            //    .Select(g => new GuideResponseDto
//            //    {
//            //        Id = g.Id,
//            //        Title = g.Title,
//            //        Description = g.Description,
//            //        Days = g.Days,
//            //        Mobility = g.Mobility,
//            //        Season = g.Season,
//            //        ForWho = g.ForWho,
//            //        Activities = g.Activities.Select(a => new ActivityResponseDto
//            //        {
//            //            Id = a.Id,
//            //            Title = a.Title,
//            //            Description = a.Description,
//            //            CategoryCategory = a.CategoryCategory,
//            //            Address = a.Address,
//            //            Phone = a.Phone,
//            //            Schedule = a.Schedule,
//            //            Website = a.Website,
//            //            Order = a.Order,
//            //            Day = a.Day
//            //        }).ToList()
//            //    })
//            //    .ToListAsync();

//            //return Ok(guides);
//            return Ok(await _context.Guides.Include(g => g.Activities).ToListAsync());
//        }

//        // POST: api/guides
//        [Authorize(Roles = "Admin")]
//        [HttpPost]
//        public async Task<IActionResult> CreateGuide(GuideCreateDto dto)
//        {
//            var guide = new Guide
//            {
//                Title = dto.Title,
//                Description = dto.Description,
//                Days = dto.Days,
//                Mobility = dto.Mobility,
//                Season = dto.Season,
//                ForWho = dto.ForWho
//            };

//            _context.Guides.Add(guide);
//            await _context.SaveChangesAsync();

//            return Ok(guide);
//        }

//        // POST: api/guides/activity
//        [Authorize(Roles = "Admin")]
//        [HttpPost("activity")]
//        public async Task<IActionResult> AddActivity(ActivityCreateDto dto)
//        {
//            var activity = new Activity
//            {
//                Title = dto.Title,
//                Description = dto.Description,
//                CategoryCategory = dto.CategoryCategory,
//                Address = dto.Address,
//                Phone = dto.Phone,
//                Schedule = dto.Schedule,
//                Website = dto.Website,
//                Order = dto.Order,
//                Day = dto.Day,
//                GuideId = dto.GuideId
//            };

//            _context.Activities.Add(activity);
//            await _context.SaveChangesAsync();

//            return Ok(activity);
//        }
//    }
//}