using HenriTrips.Application.DTOs.Guide;
using HenriTrips.Application.UseCases.Activities;
using HenriTrips.Application.UseCases.Guides;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HenriTrips.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class GuidesController : ControllerBase
{
    private readonly GetGuides _getGuides;
    private readonly GetGuideById _getGuideById;
    private readonly CreateGuide _createGuide;
    private readonly UpdateGuide _updateGuide;
    private readonly DeleteGuide _deleteGuide;
    private readonly InviteUser _inviteUser;
    public GuidesController(GetGuides getGuides, GetGuideById getGuideById, CreateGuide createGuide, UpdateGuide updateGuide, DeleteGuide deleteGuide, InviteUser inviteUser)
    {
        _getGuides = getGuides;
        _getGuideById = getGuideById;
        _createGuide = createGuide;
        _updateGuide = updateGuide;
        _deleteGuide = deleteGuide;
        _inviteUser = inviteUser;

    }

    [HttpGet]
    public async Task<IActionResult> GetGuides()
    {
        var guides = await _getGuides.ExecuteAsync();
        return Ok(guides);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _getGuideById.ExecuteAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] GuideCreateDto dto)
    {
         if (!ModelState.IsValid)
        return BadRequest(ModelState);
    
        var id = await _createGuide.ExecuteAsync(dto);
        return Ok(id);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, GuideUpdateDto dto)
    {
        var ok = await _updateGuide.ExecuteAsync(id, dto);
        if (!ok) return NotFound();
        return Ok();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _deleteGuide.ExecuteAsync(id);
        if (!ok) return NotFound();
        return Ok();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{guideId}/invite/{userId}")]
    public async Task<IActionResult> Invite(int guideId, string userId)
    {
        await _inviteUser.ExecuteAsync(guideId, userId);
        return Ok();
    }

    // ========== NEW PERMISSION ENDPOINTS ==========

    [Authorize(Roles = "Admin")]
    [HttpGet("user/{userId}/invited-guides")]
    public async Task<IActionResult> GetUserInvitedGuides(string userId, [FromServices] GetUserInvitedGuides getUserInvitedGuides)
    {
        var guideIds = await getUserInvitedGuides.ExecuteAsync(userId);
        return Ok(guideIds);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{guideId}/remove-user/{userId}")]
    public async Task<IActionResult> RemoveUserFromGuide(int guideId, string userId, [FromServices] RemoveUserFromGuide removeUserFromGuide)
    {
        var result = await removeUserFromGuide.ExecuteAsync(guideId, userId);
        if (!result)
            return NotFound(new { Message = "User not found in this guide" });

        return Ok(new { Message = "User removed from guide successfully" });
    }

    // Compatibility endpoint for frontend
    [HttpGet("{guideId}/activities")]
    public async Task<IActionResult> GetActivitiesByGuideIdCompatibility(int guideId, [FromServices] GetActivitiesByGuideId getActivitiesByGuideId)
    {
        var result = await getActivitiesByGuideId.ExecuteAsync(guideId);
        return Ok(result);
    }
}