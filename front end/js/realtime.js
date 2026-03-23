// Digital Dispatch Realtime Engine (Socket.io + Notifications)
const API_BASE = 'http://localhost:3000';
let socket;
let notificationPermission = 'default';

class RealtimeEngine {
  constructor(role) {
    this.role = role;
    this.initSocket();
    this.initPush();
  }

  initSocket() {
    socket = io(API_BASE, { autoConnect: true });
    
    socket.on('connect', () => {
      console.log('🔌 Realtime connected:', socket.id);
      this.emitStatus();
    });

    socket.on('disconnect', () => console.log('❌ Realtime disconnected'));

    // Role-specific events
    socket.on('tripUpdate', data => this.handleTripUpdate(data));
    socket.on('newRequest', data => this.handleNewRequest(data));
    socket.on('driverAssigned', data => this.handleDriverAssigned(data));
    
    // Status updates
    socket.on('providerStatus', data => this.updateProviderStatus(data));
  }

  emitStatus() {
    socket.emit('statusUpdate', { role: this.role, status: 'online', lat: 0, lng: 0 });
  }

  handleTripUpdate(data) {
    showNoty(`Trip #${data.request_id}: ${data.status}`, 'info');
    loadRequests();
    this.showInAppNotification(data);
  }

  handleNewRequest(data) {
    if (this.role === 'dispatcher') {
      showNoty(`New request from ${data.user_name}`, 'warning');
    }
  }

  handleDriverAssigned(data) {
    if (this.role === 'driver') {
      showNoty(`New trip assigned! #${data.request_id}`, 'success');
      navigator.vibrate([200, 100, 200]);
    }
  }

  async initPush() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      notificationPermission = await Notification.requestPermission();
      
      if (notificationPermission === 'granted') {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Backend needed
        });
        // Register subscription with backend
        await fetch(`${API_BASE}/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub)
        });
      }
    }
  }

  showInAppNotification(data) {
    // In-app toast (Noty or custom)
    new Noty({
      text: `${data.title || 'Update'}: ${data.message}`,
      type: data.type || 'info',
      timeout: false,
      layout: 'topRight',
      theme: 'mint',
      actions: [
        {
          text: 'View',
          action: () => window.location.href = `/dashboard.html#${data.id}`,
          onClose: () => true
        }
      ]
    }).show();
  }

  sendLocation(lat, lng) {
    socket.emit('locationUpdate', { lat, lng });
  }

  requestTrip(id) {
    socket.emit('acceptTrip', { request_id: id });
  }
}

// Role-specific instances
const realtime = new RealtimeEngine(localStorage.getItem('userRole') || 'dispatcher');

// Util: VAPID helper
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Auto-reconnect
setInterval(() => {
  if (!socket.connected) socket.connect();
}, 5000);

// Export for other scripts
window.RealtimeEngine = RealtimeEngine;

