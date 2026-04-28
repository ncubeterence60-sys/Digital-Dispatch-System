/**
 * Nasho Technologies Service Marketplace - Configuration
 */
window.API_CONFIG = {
  API_BASE_URL: window.location.origin,
  ENDPOINTS: {
    LOGIN: '/login',
    ROLES: {
      ADMIN: 'admin-dashboard.html',
      DISPATCHER: 'dashboard_fixed.html',
      DRIVER: 'driver-dashboard.html'
    },
    SERVICES: '/services',
    REQUESTS: '/requests',
    DRIVERS: {
      STATUS: '/api/drivers/:driverId/status',
      TRIPS: '/api/drivers/:driverId/trips',
      ACCEPT: '/api/drivers/:driverId/trips/:tripId/accept',
      REJECT: '/api/drivers/trips/:tripId/reject',
      EARNINGS: '/api/drivers/:driverId/earnings'
    }
  }
};


window.getApiUrl = function(endpoint) {
  return `${API_CONFIG.API_BASE_URL}${endpoint}`;
};

console.log('✅ Nasho Technologies Config loaded');

