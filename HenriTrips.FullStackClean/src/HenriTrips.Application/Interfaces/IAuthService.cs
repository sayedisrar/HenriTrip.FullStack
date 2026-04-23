using System;
using System.Collections.Generic;
using System.Text;

namespace HenriTrips.Application.Interfaces;

public interface IAuthService
{
    Task<string> LoginAsync(string email, string password);
    Task<bool> RegisterAsync(string email, string password);
}