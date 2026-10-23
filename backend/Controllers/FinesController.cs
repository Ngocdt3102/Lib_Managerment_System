using System.Security.Claims;
using LibManagementSystem.API.Models;
using LibManagementSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibManagementSystem.API.Controllers
{
    /// <summary>
    /// Quản lý phí phạt mượn sách quá hạn hoặc làm hỏng/mất sách
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class FinesController : ControllerBase
    {
        private readonly IFineService _fineService;

        public FinesController(IFineService fineService)
        {
            _fineService = fineService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách phiếu phạt trong hệ thống (có thể lọc theo trạng thái)
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="status">Trạng thái phiếu phạt (PENDING, PAID, WAIVED...)</param>
        /// <response code="200">Danh sách phiếu phạt</response>
        [HttpGet]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> GetAllFines([FromQuery] string? status)
        {
            var result = await _fineService.GetAllFinesAsync(status);
            return Ok(result);
        }

        /// <summary>
        /// Lấy danh sách các khoản phạt của chính tài khoản đang đăng nhập
        /// </summary>
        /// <response code="200">Danh sách phiếu phạt cá nhân</response>
        [HttpGet("my-fines")]
        public async Task<IActionResult> GetMyFines()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _fineService.GetMyFinesAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Xác nhận đã thu tiền phạt và chuyển trạng thái phiếu phạt sang đã thanh toán
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="id">Mã ID phiếu phạt</param>
        /// <response code="200">Thanh toán tiền phạt thành công</response>
        /// <response code="400">Không tìm thấy phiếu phạt hoặc phiếu đã được thanh toán trước đó</response>
        [HttpPut("{id}/pay")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> PayFine(string id)
        {
            var result = await _fineService.PayFineAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
