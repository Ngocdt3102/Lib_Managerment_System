using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibManagementSystem.API.Models
{
    public class BorrowRecord
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;

        [BsonElement("bookId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string BookId { get; set; } = string.Empty;

        [BsonElement("borrowDate")]
        public DateTime BorrowDate { get; set; } = DateTime.UtcNow;

        [BsonElement("dueDate")]
        public DateTime DueDate { get; set; }

        [BsonElement("returnDate")]
        public DateTime? ReturnDate { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = BorrowStatus.Borrowed; // Borrowed, Returned, Overdue, Lost

        [BsonElement("notes")]
        public string Notes { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public static class BorrowStatus
    {
        public const string Borrowed = "Borrowed";
        public const string Returned = "Returned";
        public const string Overdue = "Overdue";
        public const string Lost = "Lost";
    }
}
