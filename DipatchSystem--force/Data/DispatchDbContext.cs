using Microsoft.EntityFrameworkCore;
using DipatchSystem__force.Models;

namespace DipatchSystem__force.Data
{
    public class DispatchDbContext : DbContext
    {
        public DispatchDbContext(DbContextOptions<DispatchDbContext> options) : base(options)
        {
        }

        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<Dispatch> Dispatches { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Driver entity
            modelBuilder.Entity<Driver>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired(false).HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Vehicle).HasMaxLength(100);
                entity.Property(e => e.VehicleRegistration).HasMaxLength(50);
                entity.Property(e => e.VehicleMake).HasMaxLength(50);
                entity.Property(e => e.VehicleModel).HasMaxLength(50);
                entity.Property(e => e.VehicleColor).HasMaxLength(50);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("Offline");
                entity.HasMany(d => d.Trips).WithOne(t => t.Driver).HasForeignKey(t => t.DriverId).OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Trip entity
            modelBuilder.Entity<Trip>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PickupLocation).IsRequired().HasMaxLength(255);
                entity.Property(e => e.DropoffLocation).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PassengerName).HasMaxLength(100);
                entity.Property(e => e.PassengerPhone).HasMaxLength(20);
                entity.Property(e => e.PassengerEmail).HasMaxLength(100);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("Pending");
                entity.Property(e => e.Fare).HasColumnType("decimal(10,2)");
                entity.Property(e => e.TipAmount).HasColumnType("decimal(10,2)");
                entity.HasOne(t => t.Driver).WithMany(d => d.Trips).HasForeignKey(t => t.DriverId).OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Dispatch entity
            modelBuilder.Entity<Dispatch>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Status).HasMaxLength(50);
            });
        }
    }
}
