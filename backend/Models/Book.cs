using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibManagementSystem.API.Models
{
    public class Book
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("author")]
        public string Author { get; set; } = string.Empty;

        [BsonElement("isbn")]
        public string Isbn { get; set; } = string.Empty;

        [BsonElement("categoryId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string CategoryId { get; set; } = string.Empty;

        [BsonElement("publisher")]
        public string Publisher { get; set; } = string.Empty;

        [BsonElement("publishYear")]
        public int PublishYear { get; set; }

        [BsonElement("totalCopies")]
        public int TotalCopies { get; set; }

        [BsonElement("availableCopies")]
        public int AvailableCopies { get; set; }

        [BsonElement("location")]
        public string Location { get; set; } = string.Empty;

        [BsonElement("coverImageUrl")]
        public string CoverImageUrl { get; set; } = string.Empty;

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
