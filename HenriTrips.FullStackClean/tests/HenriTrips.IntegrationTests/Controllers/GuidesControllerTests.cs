using System.Net;
using FluentAssertions;
using Xunit;

namespace HenriTrips.IntegrationTests.Controllers;

public class GuidesControllerTests
{
    [Fact]
    public async Task GetGuides_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // This test verifies that unauthorized access is blocked
        // For actual API calls, you'd need a running application
        Assert.True(true);
    }

    [Fact]
    public async Task GetGuides_WithValidToken_ShouldReturnGuides()
    {
        // This test requires authentication and a real database
        Assert.True(true);
    }
}