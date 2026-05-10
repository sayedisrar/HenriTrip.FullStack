namespace HenriTrips.Application.DTOs.Auth;

public class UpdateUserDto
{
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Role { get; set; }
    public string? Password { get; set; }
    public List<int>? GuideIds { get; set; }
}
