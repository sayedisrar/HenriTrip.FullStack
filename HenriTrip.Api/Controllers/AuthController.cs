using Microsoft.AspNetCore.Mvc;

namespace HenriTrip.Api.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
