using FluentValidation;
using HenriTrips.Application.DTOs.Activity;

namespace HenriTrips.Application.Validators.Activity
{
    public class ActivityUpdateDtoValidator : AbstractValidator<ActivityUpdateDto>
    {
        public ActivityUpdateDtoValidator()
        {
            RuleFor(x => x.Title).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.CategoryCategory).IsInEnum();
            RuleFor(x => x.Address).NotEmpty();

            RuleFor(x => x.Phone)
                .NotEmpty()
                .Matches(@"^[0-9+\s()-]{6,20}$");

            RuleFor(x => x.Schedule).NotEmpty();

            RuleFor(x => x.Website)
                .Must(BeAValidUrl)
                .When(x => !string.IsNullOrWhiteSpace(x.Website));

            RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Day).GreaterThan(0);
        }

        private bool BeAValidUrl(string url)
        {
            return Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }
}
