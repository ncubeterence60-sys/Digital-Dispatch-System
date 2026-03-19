@echo off
echo ============================================
echo  Nasho Technologies Dispatch System API
echo ============================================
echo.
echo This Bruno collection provides comprehensive
echo API testing for your dispatch system.
echo.
echo Quick Start:
echo -----------
echo 1. Install Bruno: https://www.bruno.app/
echo 2. Open Bruno application
echo 3. File -> Open Collection -> Select this folder
echo 4. Select "Local Development" environment
echo 5. Start with Authentication -> Login
echo.
echo API Endpoints Available:
echo ------------------------
echo ✓ POST /login - User authentication
echo ✓ GET /drivers - Get all drivers
echo ✓ PUT /drivers/{id}/location - Update GPS
echo ✓ PUT /drivers/{id}/status - Update availability
echo ✓ GET /trips - Get all trips
echo ✓ POST /trips - Create new trip
echo ✓ PUT /trips/{id}/status - Update trip status
echo.
echo Your Driver (Phone: 0782944287):
echo ---------------------------------
echo Name: Nasho Driver
echo ID: 7
echo Status: Available
echo Vehicle: Honda Civic
echo.
echo Test Commands:
echo --------------
echo - Login: POST /login with admin/admin
echo - Get Drivers: GET /drivers
echo - Update Location: PUT /drivers/7/location
echo - Create Trip: POST /trips
echo.
echo Environment Variables:
echo ----------------------
echo base_url: http://localhost:3000
echo driver_id: 7 (your driver)
echo username: admin
echo password: admin
echo.
echo ============================================
pause