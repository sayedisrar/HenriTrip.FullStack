using HenriTrips.Application.Common;
using HenriTrips.Application.DTOs.Activity;
using HenriTrips.Application.UseCases.Activities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HenriTrips.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly CreateActivity _createActivity;
    private readonly UpdateActivity _updateActivity;
    private readonly DeleteActivity _deleteActivity;
    private readonly GetActivitiesByGuideId _getByGuide;

    public ActivitiesController(
        CreateActivity createActivity,
        UpdateActivity updateActivity,
        DeleteActivity deleteActivity,
        GetActivitiesByGuideId getByGuide)
    {
        _createActivity = createActivity;
        _updateActivity = updateActivity;
        _deleteActivity = deleteActivity;
        _getByGuide = getByGuide;
    }

    // GET: api/activities/guide/1
    [HttpGet("guide/{guideId}")]
    public async Task<IActionResult> GetByGuide(int guideId)
    {
        var result = await _getByGuide.ExecuteAsync(guideId);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = result
        });
    }

    // POST: api/activities
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(ActivityCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Invalid data",
                Data = ModelState
            });
        }

        var id = await _createActivity.ExecuteAsync(dto);

        return Ok(new ApiResponse<int>
        {
            Success = true,
            Data = id,
            Message = "Activity created successfully"
        });
    }

    // PUT: api/activities/5
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ActivityUpdateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Invalid data",
                Data = ModelState
            });
        }

        var ok = await _updateActivity.ExecuteAsync(id, dto);

        if (!ok)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Activity not found"
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Activity updated successfully"
        });
    }

    // DELETE: api/activities/5
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _deleteActivity.ExecuteAsync(id);

        if (!ok)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Activity not found"
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Activity deleted successfully"
        });
    }
}
