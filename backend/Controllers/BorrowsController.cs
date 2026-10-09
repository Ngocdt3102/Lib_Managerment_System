using System.Security.Claims;
using LibManagementSystem.API.DTOs;
using LibManagementSystem.API.Models;
using LibManagementSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibManagementSystem.API.Controllers
{
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

        [HttpGet]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Librarian}")]
        public async Task<IActionResult> GetAllLoans([FromQuery] string? status)
        {
            var result = await _borrowService.GetAllLoansAsync(status);
            return Ok(result);
        }

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
