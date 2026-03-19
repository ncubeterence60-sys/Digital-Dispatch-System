# Database Migration Instructions

## Overview
This document provides instructions for applying the database schema updates for the Dispatch System.

## Prerequisites
- SQL Server installed and running
- SQL Server Management Studio (SSMS) or SQL Server Data Tools
- Database credentials with admin privileges

## Application Methods

### Method 1: Using SQL Server Management Studio (SSMS)

1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. In Object Explorer, right-click on your database (`DispatchSystemDb`) and select **New Query**
4. Copy and paste the contents of `Migrations\DispatchSystemMigration_001.sql`
5. Click **Execute** or press `Ctrl+E`
6. Verify the success message appears: "Database migration completed successfully!"

### Method 2: Using SQL Command Line (sqlcmd)

1. Open Command Prompt or PowerShell
2. Run the following command:

```powershell
sqlcmd -S localhost -d DispatchSystemDb -i "c:\Users\ncube\Desktop\Digital Dispatch system\DipatchSystem--force\Migrations\DispatchSystemMigration_001.sql"
```

**Note:** Adjust the server name (`-S`) and database name (`-d`) if different from defaults.

### Method 3: Using .NET EF Core CLI (Entity Framework)

If you have Entity Framework Core tools installed:

```bash
cd "c:\Users\ncube\Desktop\Digital Dispatch system\DipatchSystem--force"
dotnet ef database update
```

## Expected Schema Changes

### Drivers Table - Modified
- **New Columns:**
  - `Email` (nvarchar(100))
  - `VehicleRegistration` (nvarchar(50))
  - `VehicleMake` (nvarchar(50))
  - `VehicleModel` (nvarchar(50))
  - `VehicleColor` (nvarchar(50))
  - `Status` (nvarchar(50)) - Default: 'Offline'
  - `Latitude` (float)
  - `Longitude` (float)
  - `CreatedAt` (datetime2)
  - `UpdatedAt` (datetime2)

### Trips Table - Created
- `Id` (int, Primary Key, Auto-increment)
- `PickupLocation` (nvarchar(255)) - Required
- `DropoffLocation` (nvarchar(255)) - Required
- `PassengerName` (nvarchar(100))
- `PassengerPhone` (nvarchar(20))
- `PassengerEmail` (nvarchar(100))
- `Status` (nvarchar(50)) - Default: 'Pending'
- `CreatedAt` (datetime2)
- `PickupTime` (datetime2)
- `DropoffTime` (datetime2)
- `DistanceKm` (float)
- `EstimatedDurationMinutes` (float)
- `ActualDurationMinutes` (float)
- `Fare` (decimal(10,2))
- `TipAmount` (decimal(10,2))
- `Notes` (nvarchar(max))
- `DriverId` (int, Foreign Key)

### Dispatches Table - Created
- `Id` (int, Primary Key, Auto-increment)
- `Description` (nvarchar(500))
- `Status` (nvarchar(50))

## Verification

After applying the migration, run these queries to verify:

```sql
-- Check Drivers table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Drivers'
ORDER BY ORDINAL_POSITION;

-- Check Trips table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Trips'
ORDER BY ORDINAL_POSITION;

-- Check Dispatches table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Dispatches'
ORDER BY ORDINAL_POSITION;

-- View sample data
SELECT * FROM Drivers;
SELECT * FROM Trips;
```

## Rollback (If Needed)

To revert the changes, you would need to:
1. Drop the Trips table (due to foreign key constraint)
2. Remove the added columns from Drivers
3. Drop Dispatches table if it was newly created

**Important:** Always backup your database before performing migrations.

## Support

If you encounter any issues:
1. Check that SQL Server is running
2. Verify the connection string in `appsettings.json`
3. Ensure you have proper database permissions
4. Review the SQL error messages for specifics

## Next Steps

After applying the migration:
1. Rebuild the .NET project: `dotnet build`
2. Run Entity Framework migrations if using Code-First: `dotnet ef database update`
3. Test the application endpoints to ensure they work with the new schema
