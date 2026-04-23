using HenriTrips.Application.DTOs.Guide;
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

}