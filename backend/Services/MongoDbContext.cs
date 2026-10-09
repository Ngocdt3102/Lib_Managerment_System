using LibManagementSystem.API.Configurations;
using LibManagementSystem.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace LibManagementSystem.API.Services
{
    public interface IMongoDbContext
    {
        IMongoCollection<User> Users { get; }
        IMongoCollection<Category> Categories { get; }
        IMongoCollection<Book> Books { get; }
        IMongoCollection<BorrowRecord> BorrowRecords { get; }
        IMongoCollection<Fine> Fines { get; }
    }

    public class MongoDbContext : IMongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            _database = client.GetDatabase(settings.Value.DatabaseName);
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<Category> Categories => _database.GetCollection<Category>("categories");
        public IMongoCollection<Book> Books => _database.GetCollection<Book>("books");
        public IMongoCollection<BorrowRecord> BorrowRecords => _database.GetCollection<BorrowRecord>("borrowRecords");
        public IMongoCollection<Fine> Fines => _database.GetCollection<Fine>("fines");
    }
}
