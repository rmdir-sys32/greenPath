/**
 * Home Page — Composition layer.
 * Composes hooks and components together. ZERO business logic.
 *
 * Architecture: Hooks → Data → Components → UI
 */

'use client';

import AQIInfoButton from '@/components/AQIInfoButton';
import HealthExposureWidget from '@/components/HealthExposureWidget';
import LoadingOverlay from '@/components/LoadingOverlay';
import Map from '@/components/Map';
import PollutionChart from '@/components/PollutionChart';
import RouteComparisonPanel from '@/components/RouteComparisonPanel';
import RouteStatsBar from '@/components/RouteStatsBar';
import SearchBar from '@/components/SearchBar';
import ThemeToggle from '@/components/ThemeToggle';
import { useAirQuality } from '@/hooks/useAirQuality';
import { useHealthScore } from '@/hooks/useHealthScore';
import { useRoute } from '@/hooks/useRoute';
import { useUserLocation } from '@/hooks/useUserLocation';
import type { Coordinates } from '@/types/location';
import { useState } from 'react';

export default function Home() {
  // ─── Hooks: Data Layer ─────────────────────────────────────────
  const {
    location: userLocation,
    isManual,
    setManualLocation,
    resetToGPS,
  } = useUserLocation();

  const [destination, setDestination] = useState<Coordinates | null>(null);

  const {
    routeData,
    routeState,
    scoredRoutes,
    selectedIndex,
    setSelectedIndex,
  } = useRoute(userLocation, destination);

  const { aqiData, isLoading: aqiLoading } = useAirQuality(userLocation);

  // Derive stats from selected route
  const selectedRoute = scoredRoutes[selectedIndex] ?? null;
  const bestRoute = scoredRoutes[0] ?? null;
  const worstRoute = scoredRoutes[scoredRoutes.length - 1] ?? null;

  const bestStats = bestRoute
    ? {
      avgPm25: bestRoute.avgPm25,
      durationMin: bestRoute.durationMin,
      distanceKm: bestRoute.distanceKm,
    }
    : null;

  // Health score: compare best route vs worst route
  const { exposureScore, doseReduction, isVulnerableWarning } = useHealthScore(
    bestStats,
    worstRoute?.durationMin ?? 0,
    worstRoute?.avgPm25 ?? 0,
  );

  // ─── Handlers ──────────────────────────────────────────────────
  const handleStartChange = (coords: Coordinates) => {
    setManualLocation(coords);
  };

  const handleDestinationChange = (coords: Coordinates) => {
    setDestination(coords);
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <main className="relative z-10 flex flex-col items-center w-screen h-[100dvh] bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="relative flex flex-col w-full h-full">
        {/* Map — Full screen background with AQI markers */}
        <Map
          userLocation={userLocation}
          destination={destination}
          routeGeoJSON={routeData}
          aqiSamples={selectedRoute?.aqiSamples}
        />

        {/* Loading Overlay */}
        {routeState === 'loading' && <LoadingOverlay />}

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* AQI Info Button — Collapsible (only when no route comparison) */}
        {routeState !== 'success' && <AQIInfoButton data={aqiData} isLoading={aqiLoading} />}

        {/* Route Comparison Panel — All routes with stats */}
        {routeState === 'success' && scoredRoutes.length > 0 && (
          <RouteComparisonPanel
            routes={scoredRoutes}
            selectedIndex={selectedIndex}
            onSelectRoute={setSelectedIndex}
          />
        )}

        {/* Health Exposure Widget — Top Right (when route found) */}
        {routeState === 'success' && (
          <HealthExposureWidget
            exposureScore={exposureScore}
            doseReduction={doseReduction}
            isVulnerableWarning={isVulnerableWarning}
          />
        )}

        {/* Pollution Chart — Desktop only */}
        {routeState === 'success' && selectedRoute && selectedRoute.aqiSamples.length > 0 && (
          <PollutionChart samples={selectedRoute.aqiSamples} />
        )}

        {/* Route Stats Bar — Bottom (above search) */}
        {routeState === 'success' && bestStats && exposureScore && (
          <RouteStatsBar
            stats={bestStats}
            doseReduction={doseReduction}
            inhaledDose={exposureScore.totalDose}
          />
        )}

        {/* Search Bar — Bottom Center */}
        <SearchBar
          onStartChange={handleStartChange}
          onDestinationChange={handleDestinationChange}
          onResetGPS={resetToGPS}
          isManualStart={isManual}
          userLocation={userLocation}
        />
      </div>
    </main>
  );
}