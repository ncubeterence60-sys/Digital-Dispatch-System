// Enhanced Realtime Engine with Payments
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

// Init based on role
window.RealtimeEngine = RealtimeEngine;
const realtime = new RealtimeEngine(localStorage.getItem('role') || 'customer');
