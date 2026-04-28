declare module 'leaflet' {
  import L from 'leaflet';
  export = L;
  export as namespace L;

  type LatLngExpression = [number, number] | { lat: number; lng: number };
}
