namespace DipatchSystem__force.Models
{
    public class Trip
    {
        public int Id { get; set; }
        public required string PickupLocation { get; set; }
        public required string DropoffLocation { get; set; }
        public string? PassengerName { get; set; }
        public string? PassengerPhone { get; set; }
        public string? PassengerEmail { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, In Progress, Completed, Cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PickupTime { get; set; }
        public DateTime? DropoffTime { get; set; }
        public double? DistanceKm { get; set; }
        public double? EstimatedDurationMinutes { get; set; }
        public double? ActualDurationMinutes { get; set; }
        public decimal? Fare { get; set; }
        public decimal? TipAmount { get; set; }
        public string? Notes { get; set; }
        public int DriverId { get; set; }
        public Driver? Driver { get; set; }
    }
}