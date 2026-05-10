using FluentAssertions;
using HenriTrips.Domain.Entities;
using HenriTrips.Domain.Enums;
using Xunit;

namespace HenriTrips.UnitTests.Domain;

public class GuideTests
{
    [Fact]
    public void CreateGuide_WithValidData_ShouldSetPropertiesCorrectly()
    {
        // Arrange & Act
        var guide = new Guide
        {
            Id = 1,
            Title = "Paris Explorer",
            Description = "Discover the beauty of Paris",
            Days = 5,
            Mobility = "walking,metro",
            Season = "spring,summer",
            ForWho = "couples,family"
        };

        // Assert
        guide.Id.Should().Be(1);
        guide.Title.Should().Be("Paris Explorer");
        guide.Description.Should().Be("Discover the beauty of Paris");
        guide.Days.Should().Be(5);
        guide.Mobility.Should().Contain("walking");
        guide.Season.Should().Contain("spring");
        guide.ForWho.Should().Contain("family");
    }

    [Fact]
    public void Guide_CanHaveMultipleActivities()
    {
        // Arrange
        var guide = new Guide { Id = 1, Title = "Test Guide" };
        var activity1 = new Activity { Id = 1, Title = "Activity 1", Day = 1, Order = 1 };
        var activity2 = new Activity { Id = 2, Title = "Activity 2", Day = 2, Order = 2 };

        // Act
        guide.Activities.Add(activity1);
        guide.Activities.Add(activity2);

        // Assert
        guide.Activities.Should().HaveCount(2);
        guide.Activities.Should().Contain(activity1);
        guide.Activities.Should().Contain(activity2);
    }
}