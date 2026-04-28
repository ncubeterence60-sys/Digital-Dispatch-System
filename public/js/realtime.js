// Enhanced Realtime Engine with Driver Location & Map Support
const API_BASE = location.host.includes('localhost') ? 'http://localhost:3000' : '';

let socket;

class RealtimeEngine {
  constructor(role) {
    this.role = role;
    this.initSocket();
  }

  initSocket() {
    socket = io(API_BASE);
    
    socket.on('connect', () => console.log('🔌 Connected:', socket.id));
    
    socket.on('tripUpdate', data => this.handleTripUpdate(data));
    socket.on('newRequest', data => this.handleNewRequest(data));
    socket.on('driverAssigned', data => this.handleDriverAssigned(data));
    socket.on('paymentStatus', data => this.handlePaymentUpdate(data));
    socket.on('driverStatus', data => this.handleDriverStatus(data));
    
    // New: Driver location updates for customer tracking
    socket.on('driverLocation', data => this.handleDriverLocation(data));
    
    // Customer location sharing (optional)
    socket.on('customerLocationRequest', data => this.handleCustomerLocationRequest(data));
  }

  handleDriverLocation(data) {
    // Dispatch to map update (window.mapUpdateDriver)
    if (window.mapUpdateDriver) {
      window.mapUpdateDriver(data.lat, data.lng, data.driverId, data.heading || 0);
    }
    console.log('📍 Driver location:', data);
    showNoty(`Driver at ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`, 'info');
  }

  handleCustomerLocationRequest(data) {
    // Share customer location if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        socket.emit('customerLocation', {
          tripId: data.tripId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      });
    }
  }

  handlePaymentUpdate(data) {
    showNoty(`Payment ${data.status.toUpperCase()}: Trip #${data.trip_id || data.payment_id}`, 'success');
  }

  handleTripUpdate(data) {
    showNoty(`Trip ${data.status}: #${data.tripId || data.request_id}`, 'info');
  }

  handleNewRequest(data) {
    if (this.role === 'dispatcher') showNoty(`New trip #${data.trip_id}`, 'warning');
  }

  handleDriverAssigned(data) {
    if (this.role === 'driver') showNoty(`Assigned trip #${data.tripId}`, 'success');
  }

  emitStatus(status = true, lat = null, lng = null, id = 1) {
    socket.emit('statusUpdate', { role: this.role, status, lat, lng, id });
  }
  
  // Expose socket for custom emits
  getSocket() {
    return socket;
  }
}

// Utils
function showNoty(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type} position-fixed`;
  toast.style.cssText = 'top:20px;right:20px;z-index:9999;max-width:350px';
  toast.innerHTML = `<i class="fas fa-${type==='success'?'check':'info'}-circle me-2"></i>${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Global map update dispatcher
window.mapUpdateDriver = function(lat, lng, driverId, heading) {
  // Called by socket handler - implemented in customer.html map
  console.log('🗺️ Update driver marker:', lat, lng);
};

// Init based on role
window.RealtimeEngine = RealtimeEngine;
const realtime = new RealtimeEngine(localStorage.getItem('role') || 'customer');
