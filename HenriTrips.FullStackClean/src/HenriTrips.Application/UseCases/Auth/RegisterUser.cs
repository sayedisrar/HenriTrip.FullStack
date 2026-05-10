using HenriTrips.Application.Common;
using HenriTrips.Application.DTOs.Auth;
using HenriTrips.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HenriTrips.Application.UseCases.Auth
{
    public class RegisterUser
    {
        private readonly IAuthService _authService;

        public RegisterUser(IAuthService authService)
        {
            _authService = authService;
        }

        public async Task<ApiResponse<string>> Execute(RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto.Email, dto.Password);

            return new ApiResponse<string>
            {
                Success = result,
                Message = result ? "User created" : "Registration failed"
            };
        }
    }
}

