# Uber-Style Real-Time Dispatch Upgrade TODO

## Overview
Upgrade Digital Dispatch to real-time Uber platform with driver tracking, Socket.io, auto-dispatch.

**Status**: Planning → Implementation

### Step 1: Dependencies [Pending]
- Update package.json: add socket.io
- npm install

### Step 2: Backend Structure [Pending]
- backend/server.js (main Socket.io server)
- backend/routes/drivers.js
- backend/routes/trips.js
- backend/services/distance.js (haversine)
- Update server-marketplace.js → rename/integrate

### Step 3: Driver API [Pending]
- POST /api/drivers/location {driver_id, lat, lng, status}
- Update DB service_providers, emit socket 'driver_update'

### Step 4: Socket.io Events [Pending]
- 'driver_location' → broadcast markers
- 'new_trip' → notify dispatchers
- 'trip_assigned' → notify driver

### Step 5: Auto-Dispatch [Pending]
- POST /api/trips → calc nearest available driver (haversine <5km)
- Assign, update status 'busy', socket notify

### Step 6: Frontend Updates [Pending]
- dashboard.html/js: Socket connect, live markers (green=available, red=busy)
- Lists: active trips/drivers

### Step 7: Test Commands [Pending]
- npm start → localhost:3000
- Driver sim: curl POST /api/drivers/location
- Create trip → auto-assign

## Commands
```
npm install socket.io
npm start
```
Driver app separate (cURL/Postman test)
