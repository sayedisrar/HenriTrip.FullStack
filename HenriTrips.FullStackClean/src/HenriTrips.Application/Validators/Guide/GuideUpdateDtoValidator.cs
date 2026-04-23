using FluentValidation;
using HenriTrips.Application.DTOs.Guide;

namespace HenriTrips.Application.Validators.Guide
{
    public class GuideUpdateDtoValidator : AbstractValidator<GuideUpdateDto>
    {
        public GuideUpdateDtoValidator()
        {
            Include(new GuideCreateDtoValidator());
        }
    }
}
