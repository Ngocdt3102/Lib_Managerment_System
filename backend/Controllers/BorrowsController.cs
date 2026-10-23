using System.Security.Claims;
using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using LibManagementSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibManagementSystem.API.Controllers
{
    /// <summary>
    /// Quản lý quy trình mượn - trả và gia hạn sách
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class BorrowsController : ControllerBase
    {
        private readonly IBorrowService _borrowService;

        public BorrowsController(IBorrowService borrowService)
        {
            _borrowService = borrowService;
        }

        /// <summary>
        /// Tạo phiếu mượn sách mới cho độc giả
        /// </summary>
        /// <param name="dto">Thông tin đăng ký mượn sách (BookId, LoanDays, Note)</param>
        /// <response code="200">Mượn sách thành công</response>
        /// <response code="400">Sách đã hết bản sao có sẵn hoặc tài khoản vượt quá giới hạn mượn</response>
        /// <response code="401">Chưa xác thực</response>
        [HttpPost]
        public async Task<IActionResult> CreateBorrow([FromBody] CreateBorrowDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _borrowService.CreateBorrowAsync(userId, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Xác nhận trả sách, cập nhật tình trạng sách và tính tiền phạt nếu quá hạn
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="id">Mã ID của phiếu mượn</param>
        /// <param name="dto">Thông tin trả sách (Tình trạng sách, ghi chú)</param>
        /// <response code="200">Trả sách thành công</response>
        /// <response code="400">Phiếu mượn không tồn tại hoặc sách đã được trả trước đó</response>
        [HttpPut("{id}/return")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> ReturnBook(string id, [FromBody] ReturnBookDto dto)
        {
            var result = await _borrowService.ReturnBookAsync(id, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Lấy lịch sử mượn sách của chính tài khoản đang đăng nhập
        /// </summary>
        /// <response code="200">Danh sách các phiếu mượn của cá nhân</response>
        [HttpGet("my-loans")]
        public async Task<IActionResult> GetMyLoans()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _borrowService.GetMyLoansAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách phiếu mượn trong hệ thống (có thể lọc theo trạng thái)
        /// </summary>
        /// <remarks>Chỉ dành cho tài khoản Admin hoặc Thủ thư</remarks>
        /// <param name="status">Trạng thái phiếu mượn (BORROWED, RETURNED, OVERDUE...)</param>
        /// <response code="200">Danh sách phiếu mượn</response>
        [HttpGet]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> GetAllLoans([FromQuery] string? status)
        {
            var result = await _borrowService.GetAllLoansAsync(status);
            return Ok(result);
        }

        /// <summary>
        /// Gia hạn ngày trả sách cho phiếu mượn
        /// </summary>
        /// <param name="id">Mã ID phiếu mượn</param>
        /// <param name="days">Số ngày muốn gia hạn (mặc định 7 ngày)</param>
        /// <response code="200">Gia hạn thành công</response>
        /// <response code="400">Không thể gia hạn (phiếu đã quá hạn, đã trả, hoặc vượt số lần tối đa)</response>
        [HttpPut("{id}/extend")]
        public async Task<IActionResult> ExtendLoan(string id, [FromQuery] int days = 7)
        {
            var result = await _borrowService.ExtendLoanAsync(id, days);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
