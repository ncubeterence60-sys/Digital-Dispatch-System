import { Prisma } from '@prisma/client';

export type { Prisma } from '@prisma/client';

// Core types
export type TripStatus = Prisma.TripStatus;
export type DriverStatus = Prisma.DriverStatus;
export type Role = Prisma.Role;

export interface DistanceResponse {
  distance_km: number;
  eta_minutes: number;
  fare_estimate: number;
}

export const PROVIDER_SPEEDS = {
  Transport: 50,
  Delivery: 40,
  Repair: 30,
  Security: 40,
  Medical: 60
} as const;

// Haversine (fallback)
export function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

