using FluentValidation;
using HenriTrips.Application.DTOs.Auth;

namespace HenriTrips.Application.Validators.Auth
{
    public class UpdateUserDtoValidator : AbstractValidator<UpdateUserDto>
    {
        public UpdateUserDtoValidator()
        {
            RuleFor(x => x.Email)
                .EmailAddress()
                .When(x => !string.IsNullOrWhiteSpace(x.Email));

            RuleFor(x => x.Password)
                .MinimumLength(6)
                .When(x => !string.IsNullOrWhiteSpace(x.Password));

            RuleFor(x => x.Role)
                .Must(r => r == "Admin" || r == "User")
                .When(x => !string.IsNullOrWhiteSpace(x.Role))
                .WithMessage("Role must be either Admin or User");
        }
    }
}
