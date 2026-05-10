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
    public class LoginUser
    {
        private readonly IAuthService _authService;

        public LoginUser(IAuthService authService)
        {
            _authService = authService;
        }

        public async Task<ApiResponse<string>> Execute(LoginDto dto)
        {
            var token = await _authService.LoginAsync(dto.Email, dto.Password);

            return new ApiResponse<string>
            {
                Success = true,
                Data = token,
                Message = "Login successful"
            };
        }
    }
}
