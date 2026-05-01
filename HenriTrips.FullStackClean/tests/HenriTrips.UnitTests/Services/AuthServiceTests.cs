using Moq;
using Microsoft.AspNetCore.Identity;
using HenriTrips.Infrastructure.Identity;
using Xunit;
using System;
using System.Threading.Tasks;

public class AuthServiceTests
{
    [Fact]
    public async Task Login_Should_Fail_When_User_Not_Found()
    {
        // Arrange
        var userManagerMock = MockUserManager();
        var signInMock = MockSignInManager();
        var tokenServiceMock = new Mock<TokenService>(null);

        var service = new AuthService(
            userManagerMock.Object,
            signInMock.Object,
            tokenServiceMock.Object
        );

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() =>
            service.LoginAsync("test@test.com", "123456"));
    }

    private static Mock<UserManager<IdentityUser>> MockUserManager()
    {
        var store = new Mock<IUserStore<IdentityUser>>();

        return new Mock<UserManager<IdentityUser>>(
            store.Object,
            null, null, null, null, null, null, null, null
        );
    }

    private static Mock<SignInManager<IdentityUser>> MockSignInManager()
    {
        var userManager = MockUserManager();

        return new Mock<SignInManager<IdentityUser>>(
            userManager.Object,
            Mock.Of<Microsoft.AspNetCore.Http.IHttpContextAccessor>(),
            Mock.Of<IUserClaimsPrincipalFactory<IdentityUser>>(),
            null, null, null, null
        );
    }
}