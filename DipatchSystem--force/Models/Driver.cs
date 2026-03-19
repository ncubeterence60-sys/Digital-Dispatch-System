
namespace DipatchSystem__force.Models
{
    public class Driver
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Vehicle { get; set; }
        public string? VehicleRegistration { get; set; }
        public string? VehicleMake { get; set; }
        public string? VehicleModel { get; set; }
        public string? VehicleColor { get; set; }
        public string Status { get; set; } = "Offline"; // Available, Busy, Offline
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public List<Trip>? Trips { get; set; }
    }
}