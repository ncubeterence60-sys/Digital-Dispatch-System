# Nasho Technologies Dispatch System API Collection

## ✅ API Testing Status: ALL TESTS PASSING

**Latest Test Results (7/7 tests passed):**
- ✅ User Login
- ✅ Get All Drivers
- ✅ Update Driver Location
- ✅ Update Driver Status
- ✅ Get All Trips
- ✅ Create New Trip
- ✅ Update Trip Status

A comprehensive Bruno collection for testing and managing the Nasho Technologies Digital Dispatch System APIs.

## 🚀 Quick Start

1. **Install Bruno**: Download from [bruno.app](https://www.bruno.app/)
2. **Open Collection**: Import the `.bruno` folder in Bruno
3. **Select Environment**: Choose "Local Development" environment
4. **Start Testing**: Run requests in the suggested order

## 📁 Collection Structure

```
.bruno/
├── bruno.json                    # Collection configuration
├── environments/
│   └── Local Development.bru     # Environment variables
├── Authentication/
│   └── Login.bru                 # User authentication
├── Drivers/
│   ├── Get All Drivers.bru       # Retrieve driver list
│   ├── Update Driver Location.bru # GPS location updates
│   └── Update Driver Status.bru  # Availability status
└── Trips/
    ├── Get All Trips.bru         # Trip management overview
    ├── Create New Trip.bru       # New trip requests
    └── Update Trip Status.bru    # Trip lifecycle updates
```

## 🔧 Environment Variables

### Local Development
- `base_url`: `http://localhost:3000` (Backend API endpoint)
- `username`: `admin` (Default login username)
- `password`: `admin` (Default login password)
- `driver_id`: `7` (Nasho Driver ID - phone: 0782944287)
- `trip_id`: `1` (Sample trip ID for testing)

## 📋 API Endpoints Overview

### Authentication
- **POST** `/login` - User authentication

### Drivers Management
- **GET** `/drivers` - Get all drivers with status/location
- **PUT** `/drivers/{id}/location` - Update driver GPS coordinates
- **PUT** `/drivers/{id}/status` - Update driver availability

### Trips Management
- **GET** `/trips` - Get all trips with details
- **POST** `/trips` - Create new trip request
- **PUT** `/trips/{id}/status` - Update trip status

## 🎯 Common Workflows

### 1. Daily Operations Check
```
Login → Get All Drivers → Get All Trips
```

### 2. Driver Location Update
```
Login → Update Driver Location (use GPS coordinates)
```

### 3. New Trip Creation
```
Login → Create New Trip → Update Trip Status → Assign Driver
```

### 4. Trip Completion
```
Login → Update Trip Status (In Progress → Completed)
```

## 🧪 Testing Features

### Built-in Test Scripts
Each request includes JavaScript test scripts that:
- ✅ Validate response status codes
- 📊 Count and summarize data
- 🔄 Store response data for follow-up requests
- 📝 Log results to console

### Response Validation
- Check HTTP status codes (200, 404, 500)
- Validate JSON response structure
- Count records and status distributions

## 📊 Sample Data

### Drivers
- **John Doe** (ID: 1) - Available, Toyota Camry
- **Jane Smith** (ID: 2) - Busy, Ford F-150
- **Nasho Driver** (ID: 7) - Available, Honda Civic, Phone: 0782944287

### Sample Trip Request
```json
{
  "pickup_location": "123 Main Street, Bulawayo CBD",
  "dropoff_location": "456 Park Road, Bulawayo",
  "passenger_name": "Sarah Johnson",
  "passenger_phone": "0778123456",
  "passenger_email": "sarah@example.com",
  "driver_id": 7,
  "notes": "Customer prefers quiet driver"
}
```

## 🗺️ GPS Coordinates (Zimbabwe)

### Major Cities
- **Bulawayo**: `{"lat": -20.15, "lng": 28.58}`
- **Harare**: `{"lat": -17.8252, "lng": 31.0335}`
- **Gweru**: `{"lat": -19.45, "lng": 29.82}`

### Test Coordinates
Use these for testing driver location updates:
```json
{"lat": -20.15, "lng": 28.58}  // Bulawayo CBD
{"lat": -20.16, "lng": 28.59}  // Bulawayo Airport area
{"lat": -20.14, "lng": 28.57}  // Bulawayo Industrial area
```

## 🔄 Status Management

### Driver Status
- **Available**: Ready for trip assignments
- **Busy**: Currently on a trip
- **Offline**: Not available for dispatch

### Trip Status
- **Pending**: Created, waiting for driver
- **In Progress**: Driver assigned, trip active
- **Completed**: Trip finished successfully
- **Cancelled**: Trip cancelled

## 🛠️ Advanced Usage

### Environment Setup
1. Create new environment files for staging/production
2. Update `base_url` for different deployment stages
3. Configure authentication tokens if needed

### Custom Variables
Add variables for:
- Specific driver IDs for testing
- Common pickup/dropoff locations
- Test passenger data
- GPS coordinates for your area

### Automated Testing
Use Bruno's CLI for CI/CD integration:
```bash
# Run all requests
bru run .bruno

# Run specific folder
bru run .bruno/Drivers

# Export results
bru run .bruno --output results.json
```

## 📞 Support & Contact

For questions about the API or this collection:
- Check the backend server logs
- Verify environment variables
- Test with the dashboard UI first
- Review API response formats

## 📝 Change Log

### v1.0.0 (March 10, 2026)
- ✅ Initial collection creation
- ✅ All core API endpoints covered
- ✅ Environment configuration
- ✅ Test scripts included
- ✅ Comprehensive documentation
- ✅ Sample data and workflows

---

**Collection Created for:** Nasho Technologies Digital Dispatch System
**API Version:** 1.0
**Bruno Version:** Compatible with v1.x
**Date:** March 10, 2026