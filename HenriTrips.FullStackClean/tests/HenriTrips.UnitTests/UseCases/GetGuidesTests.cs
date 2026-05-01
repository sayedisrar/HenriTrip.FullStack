using Moq;
using HenriTrips.Application.UseCases.Guides;
using HenriTrips.Application.Interfaces;
using HenriTrips.Domain.Entities;
using Xunit;

public class GetGuidesTests
{
    [Fact]
    public async Task Should_Return_Guides_List()
    {
        // Arrange
        var mockRepo = new Mock<IGuideRepository>();

        mockRepo.Setup(r => r.GetAllAsync())
            .ReturnsAsync(new List<Guide>
            {
                new Guide { Id = 1, Title = "Paris Trip" }
            });

        var useCase = new GetGuides(mockRepo.Object);

        // Act
        var result = await useCase.ExecuteAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal("Paris Trip", result[0].Title);
    }
}