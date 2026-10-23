using LibManagementSystem.API.Models;
using LibManagementSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibManagementSystem.API.Controllers
{
    /// <summary>
    /// Thống kê và báo cáo tổng quan dữ liệu thư viện
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
    public class StatsController : ControllerBase
    {
        private readonly IStatsService _statsService;

        public StatsController(IStatsService statsService)
        {
            _statsService = statsService;
        }

        /// <summary>
        /// Lấy số liệu thống kê tổng quan (tổng đầu sách, số sách đang mượn, quá hạn, tổng tiền phạt)
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <response code="200">Dữ liệu thống kê tổng quan</response>
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var result = await _statsService.GetDashboardStatsAsync();
            return Ok(result);
        }
    }
}
