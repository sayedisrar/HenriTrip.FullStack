using System.Net;
using Xunit;

public class GuidesControllerTests : IClassFixture<CustomWebAppFactory>
{
    private readonly HttpClient _client;

    public GuidesControllerTests(CustomWebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetGuides_Should_Return_OK()
    {
        // Act
        var response = await _client.GetAsync("/api/guides");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}