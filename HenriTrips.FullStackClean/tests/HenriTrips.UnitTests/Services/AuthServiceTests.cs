using FluentAssertions;
using HenriTrips.Application.Interfaces;
using HenriTrips.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace HenriTrips.UnitTests.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task LoginAsync_WithInvalidEmail_ShouldThrowException()
    {
        // Arrange
        var userManagerMock = CreateUserManagerMock();
        var signInManagerMock = CreateSignInManagerMock(userManagerMock);
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(x => x["Jwt:SecretKey"]).Returns("supersecretkeythatisatleast32charslong!");
        configMock.Setup(x => x["Jwt:Issuer"]).Returns("HenriTrips");
        configMock.Setup(x => x["Jwt:Audience"]).Returns("HenriTripsUsers");
        configMock.Setup(x => x["Jwt:ExpiryMinutes"]).Returns("60");

        var tokenService = new TokenService(configMock.Object);
        var authService = new AuthService(userManagerMock.Object, signInManagerMock.Object, tokenService);

        userManagerMock.Setup(x => x.FindByEmailAsync("wrong@test.com"))
            .ReturnsAsync(null as IdentityUser);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() =>
            authService.LoginAsync("wrong@test.com", "password123"));
    }

    private static Mock<UserManager<IdentityUser>> CreateUserManagerMock()
    {
        var store = new Mock<IUserStore<IdentityUser>>();
        return new Mock<UserManager<IdentityUser>>(
            store.Object, null, null, null, null, null, null, null, null);
    }

    private static Mock<SignInManager<IdentityUser>> CreateSignInManagerMock(Mock<UserManager<IdentityUser>> userManagerMock)
    {
        var contextAccessor = new Mock<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
        var claimsFactory = new Mock<IUserClaimsPrincipalFactory<IdentityUser>>();
        return new Mock<SignInManager<IdentityUser>>(
            userManagerMock.Object, contextAccessor.Object, claimsFactory.Object, null, null, null, null);
    }
}