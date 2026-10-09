using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibManagementSystem.API.Models
{
    public class Fine
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("borrowRecordId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string BorrowRecordId { get; set; } = string.Empty;

        [BsonElement("userId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;

        [BsonElement("amount")]
        public decimal Amount { get; set; }

        [BsonElement("reason")]
        public string Reason { get; set; } = string.Empty;

        [BsonElement("status")]
        public string Status { get; set; } = FineStatus.Pending; // Pending, Paid

        [BsonElement("paidAt")]
        public DateTime? PaidAt { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public static class FineStatus
    {
        public const string Pending = "Pending";
        public const string Paid = "Paid";
    }
}
