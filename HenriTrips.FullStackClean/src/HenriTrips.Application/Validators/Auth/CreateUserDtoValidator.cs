using FluentValidation;
using HenriTrips.Application.DTOs.Auth;

namespace HenriTrips.Application.Validators.Auth
{
    public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(6);

            RuleFor(x => x.Role)
                .NotEmpty()
                .Must(r => r == "Admin" || r == "User")
                .WithMessage("Role must be either Admin or User");
        }
    }
}
