/**
 * Distance calculation service using Haversine formula
 * For OSM-based ETA estimation in Digital Dispatch
 */

 // Earth radius in km
const EARTH_RADIUS_KM = 6371;

// Speed assumptions (km/h)
const PROVIDER_SPEEDS = {
  Transport: 50,
  Delivery: 40, 
  Repair: 30,
  Security: 40,
  Medical: 60
};

/**
 * Calculate distance between two lat/lng points using Haversine
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude 
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {number} Distance in kilometers
 */
function calcDistance(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate ETA in minutes based on distance and service type speed
 * @param {number} distanceKm
 * @param {string} serviceType
 * @returns {number} Estimated minutes
 */
function calcETA(distanceKm, serviceType = 'Transport') {
  const speed = PROVIDER_SPEEDS[serviceType] || 50;
  const hours = distanceKm / speed;
  return Math.round(hours * 60);
}

/**
 * API handler for distance/ETA
 * Expects query: ?from_lat=...&from_lng=...&to_lat=...&to_lng=...&service_type=...
 */
function getDistance(req, res) {
  const { from_lat, from_lng, to_lat, to_lng, service_type_id } = req.query;
  
  if (!from_lat || !from_lng || !to_lat || !to_lng) {
    return res.status(400).json({ error: 'Missing coordinates: from_lat,from_lng,to_lat,to_lng' });
  }
  
  const lat1 = parseFloat(from_lat);
  const lng1 = parseFloat(from_lng);
  const lat2 = parseFloat(to_lat);
  const lng2 = parseFloat(to_lng);
  
  if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
    return res.status(400).json({ error: 'Invalid coordinate values' });
  }
  
  const distance = calcDistance(lat1, lng1, lat2, lng2);
  const eta = calcETA(distance, service_type_id ? 'Transport' : 'Transport');
  
  // Smart Fare Calculator
  let basePrice = 5.0, kmRate = 1.5, hourRate = 20.0;
  if (service_type_id) {
    // Get rates from DB via service_types (simplified)
    const rates = {
      '1': {base: 5.0, km: 1.5, hour: 20},  // Transport
      '2': {base: 3.0, km: 0.8, hour: 15},   // Delivery  
      '3': {base: 25.0, km: 0, hour: 30},    // Repair
      '4': {base: 30.0, km: 0, hour: 40},    // Security
      '5': {base: 50.0, km: 2.0, hour: 60}   // Medical
    };
    const serviceRates = rates[service_type_id] || rates['1'];
    basePrice = serviceRates.base;
    kmRate = serviceRates.km;
    hourRate = serviceRates.hour;
  }
  
  const distanceFare = distance * kmRate;
  const timeFare = (eta / 60) * hourRate;
  const totalFare = Math.round((basePrice + distanceFare + timeFare) * 100) / 100;
  
  res.json({
    success: true,
    distance_km: Math.round(distance * 100) / 100,
    eta_minutes: eta,
    fare_estimate: totalFare,
    fare_breakdown: {
      base: basePrice,
      distance: Math.round(distanceFare * 100) / 100,
      time: Math.round(timeFare * 100) / 100,
      total: totalFare
    },
    formatted: {
      distance: distance < 1 ? `${Math.round(distance*1000)}m` : `${Math.round(distance)}km`,
      eta: `${eta}min`,
      fare: `$${totalFare.toFixed(2)}`
    }
  });
}

module.exports = {
  calcDistance,
  calcETA,
  getDistance,
  PROVIDER_SPEEDS
};

