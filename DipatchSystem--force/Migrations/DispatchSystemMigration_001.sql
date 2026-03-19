-- SQL Migration Script for Dispatch System Database Schema Update
-- Run this against your DispatchSystemDb database

-- Create or Update Drivers table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Drivers' AND xtype='U')
BEGIN
    CREATE TABLE [Drivers] (
        [Id] int NOT NULL PRIMARY KEY IDENTITY(1,1),
        [Name] nvarchar(100),
        [Phone] nvarchar(20),
        [Email] nvarchar(100),
        [Vehicle] nvarchar(100),
        [VehicleRegistration] nvarchar(50),
        [VehicleMake] nvarchar(50),
        [VehicleModel] nvarchar(50),
        [VehicleColor] nvarchar(50),
        [Status] nvarchar(50) NOT NULL DEFAULT 'Offline',
        [Latitude] float,
        [Longitude] float,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] datetime2
    );
END
ELSE
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'Email')
        ALTER TABLE Drivers ADD Email nvarchar(100);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'VehicleRegistration')
        ALTER TABLE Drivers ADD VehicleRegistration nvarchar(50);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'VehicleMake')
        ALTER TABLE Drivers ADD VehicleMake nvarchar(50);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'VehicleModel')
        ALTER TABLE Drivers ADD VehicleModel nvarchar(50);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'VehicleColor')
        ALTER TABLE Drivers ADD VehicleColor nvarchar(50);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'Status')
        ALTER TABLE Drivers ADD Status nvarchar(50) NOT NULL DEFAULT 'Offline';
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'Latitude')
        ALTER TABLE Drivers ADD Latitude float;
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'Longitude')
        ALTER TABLE Drivers ADD Longitude float;
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'CreatedAt')
        ALTER TABLE Drivers ADD CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE();
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Drivers') AND name = 'UpdatedAt')
        ALTER TABLE Drivers ADD UpdatedAt datetime2;
END
GO

-- Create Trips table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Trips' AND xtype='U')
BEGIN
    CREATE TABLE [Trips] (
        [Id] int NOT NULL PRIMARY KEY IDENTITY(1,1),
        [PickupLocation] nvarchar(255) NOT NULL,
        [DropoffLocation] nvarchar(255) NOT NULL,
        [PassengerName] nvarchar(100),
        [PassengerPhone] nvarchar(20),
        [PassengerEmail] nvarchar(100),
        [Status] nvarchar(50) NOT NULL DEFAULT 'Pending',
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        [PickupTime] datetime2,
        [DropoffTime] datetime2,
        [DistanceKm] float,
        [EstimatedDurationMinutes] float,
        [ActualDurationMinutes] float,
        [Fare] decimal(10, 2),
        [TipAmount] decimal(10, 2),
        [Notes] nvarchar(max),
        [DriverId] int NOT NULL,
        CONSTRAINT [FK_Trips_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([Id]) ON DELETE RESTRICT
    );

    CREATE INDEX [IX_Trips_DriverId] ON [Trips] ([DriverId]);
END
ELSE
BEGIN
    -- Add new columns to Trips table if they don't exist
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'PassengerName')
        ALTER TABLE Trips ADD PassengerName nvarchar(100);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'PassengerPhone')
        ALTER TABLE Trips ADD PassengerPhone nvarchar(20);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'PassengerEmail')
        ALTER TABLE Trips ADD PassengerEmail nvarchar(100);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'Status')
        ALTER TABLE Trips ADD Status nvarchar(50) NOT NULL DEFAULT 'Pending';
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'CreatedAt')
        ALTER TABLE Trips ADD CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE();
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'DistanceKm')
        ALTER TABLE Trips ADD DistanceKm float;
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'EstimatedDurationMinutes')
        ALTER TABLE Trips ADD EstimatedDurationMinutes float;
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'ActualDurationMinutes')
        ALTER TABLE Trips ADD ActualDurationMinutes float;
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'Fare')
        ALTER TABLE Trips ADD Fare decimal(10, 2);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'TipAmount')
        ALTER TABLE Trips ADD TipAmount decimal(10, 2);
    
    IF NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('Trips') AND name = 'Notes')
        ALTER TABLE Trips ADD Notes nvarchar(max);
END
GO

-- Create Dispatches table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Dispatches' AND xtype='U')
BEGIN
    CREATE TABLE [Dispatches] (
        [Id] int NOT NULL PRIMARY KEY IDENTITY(1,1),
        [Description] nvarchar(500),
        [Status] nvarchar(50)
    );
END
GO

-- Insert sample data if needed
IF NOT EXISTS (SELECT * FROM Drivers WHERE Name = 'John Doe')
BEGIN
    INSERT INTO Drivers (Name, Phone, Email, Vehicle, VehicleRegistration, Status, CreatedAt)
    VALUES ('John Doe', '123-456-7890', 'john@example.com', 'Toyota Camry', 'ABC123', 'Available', GETUTCDATE());
END

IF NOT EXISTS (SELECT * FROM Drivers WHERE Name = 'Jane Smith')
BEGIN
    INSERT INTO Drivers (Name, Phone, Email, Vehicle, VehicleRegistration, Status, CreatedAt)
    VALUES ('Jane Smith', '098-765-4321', 'jane@example.com', 'Ford F-150', 'XYZ789', 'Busy', GETUTCDATE());
END

-- Success message
PRINT 'Database migration completed successfully!'
