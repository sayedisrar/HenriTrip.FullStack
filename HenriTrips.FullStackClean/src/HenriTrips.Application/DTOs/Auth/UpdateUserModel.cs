namespace HenriTrips.Application.DTOs.Auth;

public class UpdateUserModel
{
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Role { get; set; }
    public string? Password { get; set; }
}
