using FluentValidation;
using HenriTrips.Application.DTOs.Guide;
using System;
using System.Collections.Generic;
using System.Text;

namespace HenriTrips.Application.Validators.Guide
{
    public class GuideCreateDtoValidator : AbstractValidator<GuideCreateDto>
    {
        public GuideCreateDtoValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
            RuleFor(x => x.Days).GreaterThan(0);
            RuleFor(x => x.Mobility).NotEmpty();
            RuleFor(x => x.Season).NotEmpty();
            RuleFor(x => x.ForWho).NotEmpty();
        }
    }
}



