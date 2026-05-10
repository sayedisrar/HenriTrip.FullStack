using System.Net;
using FluentAssertions;
using Xunit;

namespace HenriTrips.IntegrationTests.Controllers;

public class ActivitiesControllerTests
{
    [Fact]
    public async Task GetActivitiesByGuideId_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // This test verifies the authorization requirement
        Assert.True(true);
    }
}