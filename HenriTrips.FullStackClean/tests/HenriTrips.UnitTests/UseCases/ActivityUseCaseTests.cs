using FluentAssertions;
using HenriTrips.Application.DTOs.Activity;
using HenriTrips.Application.Interfaces;
using HenriTrips.Application.UseCases.Activities;
using HenriTrips.Domain.Entities;
using HenriTrips.Domain.Enums;
using Moq;
using Xunit;

namespace HenriTrips.UnitTests.UseCases;

public class ActivityUseCaseTests
{
    [Fact]
    public async Task CreateActivity_ShouldAddActivityToGuide()
    {
        // Arrange
        var mockRepo = new Mock<IActivityRepository>();
        var createActivity = new CreateActivity(mockRepo.Object);

        var newActivity = new ActivityCreateDto
        {
            Title = "Eiffel Tower Visit",
            Description = "Visit the iconic Eiffel Tower",
            CategoryCategory = ActivityCategory.Museum,
            Address = "Champ de Mars, Paris",
            Phone = "+33 1 23 45 67 89",
            Schedule = "9:00 AM - 11:00 PM",
            Website = "https://toureiffel.paris",
            Order = 1,
            Day = 1,
            GuideId = 1
        };

        Activity capturedActivity = null;
        var expectedId = 10;

        mockRepo.Setup(x => x.AddAsync(It.IsAny<Activity>()))
            .Callback<Activity>(a =>
            {
                capturedActivity = a;
                a.Id = expectedId;
            })
            .Returns(Task.CompletedTask);

        // Act
        var result = await createActivity.ExecuteAsync(newActivity);

        // Assert
        result.Should().BeGreaterThan(0);
        result.Should().Be(expectedId);
        capturedActivity.Should().NotBeNull();
        capturedActivity.Title.Should().Be("Eiffel Tower Visit");
        capturedActivity.Day.Should().Be(1);
        capturedActivity.Order.Should().Be(1);
        capturedActivity.GuideId.Should().Be(1);

        mockRepo.Verify(x => x.AddAsync(It.IsAny<Activity>()), Times.Once);
    }

    [Fact]
    public async Task GetActivitiesByGuideId_ShouldReturnActivitiesForGuide()
    {
        // Arrange
        var mockRepo = new Mock<IActivityRepository>();
        var guideId = 1;
        var expectedActivities = new List<Activity>
        {
            new() { Id = 1, Title = "Activity 1", Day = 1, Order = 1, GuideId = guideId },
            new() { Id = 2, Title = "Activity 2", Day = 2, Order = 2, GuideId = guideId }
        };
        mockRepo.Setup(x => x.GetByGuideIdAsync(guideId)).ReturnsAsync(expectedActivities);

        var getActivities = new GetActivitiesByGuideId(mockRepo.Object);

        // Act
        var result = await getActivities.ExecuteAsync(guideId);

        // Assert
        result.Should().HaveCount(2);
        result[0].Title.Should().Be("Activity 1");
        result[1].Title.Should().Be("Activity 2");
    }

    [Fact]
    public async Task DeleteActivity_WhenActivityExists_ShouldDeleteSuccessfully()
    {
        // Arrange
        var mockRepo = new Mock<IActivityRepository>();
        var existingActivity = new Activity { Id = 1, Title = "To Delete" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingActivity);
        mockRepo.Setup(x => x.DeleteAsync(1)).Returns(Task.CompletedTask);

        var deleteActivity = new DeleteActivity(mockRepo.Object);

        // Act
        var result = await deleteActivity.ExecuteAsync(1);

        // Assert
        result.Should().BeTrue();
        mockRepo.Verify(x => x.DeleteAsync(1), Times.Once);
    }
}