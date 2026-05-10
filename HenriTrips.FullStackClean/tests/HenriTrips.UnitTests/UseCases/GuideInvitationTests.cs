using FluentAssertions;
using HenriTrips.Application.Interfaces;
using HenriTrips.Application.UseCases.Guides;
using Moq;
using Xunit;

namespace HenriTrips.UnitTests.UseCases;

public class GuideInvitationTests
{
    [Fact]
    public async Task GetUserInvitedGuides_ShouldReturnGuideIds_WhenUserHasInvitations()
    {
        // Arrange
        var userId = "user-123";
        var expectedGuideIds = new List<string> { "1", "2", "5" };

        var mockRepo = new Mock<IGuideRepository>();
        mockRepo.Setup(x => x.GetUserInvitedGuideIdsAsync(userId))
            .ReturnsAsync(expectedGuideIds);

        var getInvitedGuides = new GetUserInvitedGuides(mockRepo.Object);

        // Act
        var result = await getInvitedGuides.ExecuteAsync(userId);

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain("1");
        result.Should().Contain("2");
        result.Should().Contain("5");
    }

    [Fact]
    public async Task GetUserInvitedGuides_WhenUserHasNoInvitations_ShouldReturnEmptyList()
    {
        // Arrange
        var userId = "new-user";

        var mockRepo = new Mock<IGuideRepository>();
        mockRepo.Setup(x => x.GetUserInvitedGuideIdsAsync(userId))
            .ReturnsAsync(new List<string>());

        var getInvitedGuides = new GetUserInvitedGuides(mockRepo.Object);

        // Act
        var result = await getInvitedGuides.ExecuteAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task InviteUser_ShouldAddUserToGuide()
    {
        // Arrange
        var userId = "user-123";
        var guideId = 5;

        var mockRepo = new Mock<IGuideRepository>();
        mockRepo.Setup(x => x.AddUserToGuide(userId, guideId))
            .Returns(Task.CompletedTask);

        var inviteUser = new InviteUser(mockRepo.Object);

        // Act
        await inviteUser.ExecuteAsync(guideId, userId);

        // Assert
        mockRepo.Verify(x => x.AddUserToGuide(userId, guideId), Times.Once);
    }

    [Fact]
    public async Task RemoveUserFromGuide_ShouldRemoveUserFromGuide()
    {
        // Arrange
        var userId = "user-123";
        var guideId = 5;

        var mockRepo = new Mock<IGuideRepository>();
        mockRepo.Setup(x => x.RemoveUserFromGuideAsync(userId, guideId))
            .ReturnsAsync(true);

        var removeUser = new RemoveUserFromGuide(mockRepo.Object);

        // Act
        var result = await removeUser.ExecuteAsync(guideId, userId);

        // Assert
        result.Should().BeTrue();
        mockRepo.Verify(x => x.RemoveUserFromGuideAsync(userId, guideId), Times.Once);
    }
}