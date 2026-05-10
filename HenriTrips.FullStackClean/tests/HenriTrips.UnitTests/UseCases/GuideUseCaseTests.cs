using FluentAssertions;
using HenriTrips.Application.DTOs.Guide;
using HenriTrips.Application.Interfaces;
using HenriTrips.Application.UseCases.Guides;
using HenriTrips.Domain.Entities;
using Moq;
using Xunit;

namespace HenriTrips.UnitTests.UseCases;

public class GuideUseCaseTests
{
    [Fact]
    public async Task CreateGuide_ShouldCreateNewGuide_AndReturnId()
    {
        // Arrange
        var mockRepo = new Mock<IGuideRepository>();
        var createGuide = new CreateGuide(mockRepo.Object);

        var newGuide = new GuideCreateDto
        {
            Title = "Weekend in Paris",
            Description = "A perfect 3-day Paris itinerary",
            Days = 3,
            Mobility = "walking,metro",
            Season = "spring",
            ForWho = "couples"
        };

        Guide capturedGuide = null;
        var expectedId = 5; // Simulate returned ID

        mockRepo.Setup(x => x.AddAsync(It.IsAny<Guide>()))
            .Callback<Guide>(g =>
            {
                capturedGuide = g;
                g.Id = expectedId; // Set ID when added
            })
            .Returns(Task.CompletedTask);

        // Act
        var result = await createGuide.ExecuteAsync(newGuide);

        // Assert
        result.Should().BeGreaterThan(0);
        result.Should().Be(expectedId);
        capturedGuide.Should().NotBeNull();
        capturedGuide.Title.Should().Be("Weekend in Paris");
        capturedGuide.Description.Should().Be("A perfect 3-day Paris itinerary");
        capturedGuide.Days.Should().Be(3);

        mockRepo.Verify(x => x.AddAsync(It.IsAny<Guide>()), Times.Once);
    }

    // Rest of the tests remain the same...
    [Fact]
    public async Task GetGuides_ShouldReturnAllGuides()
    {
        // Arrange
        var mockRepo = new Mock<IGuideRepository>();
        var expectedGuides = new List<Guide>
        {
            new() { Id = 1, Title = "Guide 1", Days = 3 },
            new() { Id = 2, Title = "Guide 2", Days = 5 }
        };
        mockRepo.Setup(x => x.GetAllAsync()).ReturnsAsync(expectedGuides);

        var getGuides = new GetGuides(mockRepo.Object);

        // Act
        var result = await getGuides.ExecuteAsync();

        // Assert
        result.Should().HaveCount(2);
        result[0].Title.Should().Be("Guide 1");
        result[1].Title.Should().Be("Guide 2");
    }

    [Fact]
    public async Task UpdateGuide_WhenGuideExists_ShouldUpdateSuccessfully()
    {
        // Arrange
        var mockRepo = new Mock<IGuideRepository>();
        var existingGuide = new Guide { Id = 1, Title = "Old Title", Description = "Old Description", Days = 2 };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingGuide);
        mockRepo.Setup(x => x.UpdateAsync(It.IsAny<Guide>())).Returns(Task.CompletedTask);

        var updateGuide = new UpdateGuide(mockRepo.Object);
        var updateDto = new GuideUpdateDto { Title = "New Title", Description = "New Description", Days = 4 };

        // Act
        var result = await updateGuide.ExecuteAsync(1, updateDto);

        // Assert
        result.Should().BeTrue();
        existingGuide.Title.Should().Be("New Title");
        existingGuide.Description.Should().Be("New Description");
        existingGuide.Days.Should().Be(4);
    }

    [Fact]
    public async Task DeleteGuide_WhenGuideExists_ShouldDeleteSuccessfully()
    {
        // Arrange
        var mockRepo = new Mock<IGuideRepository>();
        var existingGuide = new Guide { Id = 1, Title = "To Delete" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingGuide);
        mockRepo.Setup(x => x.DeleteAsync(1)).Returns(Task.CompletedTask);

        var deleteGuide = new DeleteGuide(mockRepo.Object);

        // Act
        var result = await deleteGuide.ExecuteAsync(1);

        // Assert
        result.Should().BeTrue();
        mockRepo.Verify(x => x.DeleteAsync(1), Times.Once);
    }

    [Fact]
    public async Task DeleteGuide_WhenGuideDoesNotExist_ShouldReturnFalse()
    {
        // Arrange
        var mockRepo = new Mock<IGuideRepository>();
        mockRepo.Setup(x => x.GetByIdAsync(999)).ReturnsAsync(null as Guide);

        var deleteGuide = new DeleteGuide(mockRepo.Object);

        // Act
        var result = await deleteGuide.ExecuteAsync(999);

        // Assert
        result.Should().BeFalse();
        mockRepo.Verify(x => x.DeleteAsync(It.IsAny<int>()), Times.Never);
    }
}