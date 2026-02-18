/**
 * Route Service — API client for the GreenPath backend.
 * NO React. NO hooks. Pure async functions.
 */

import { ENDPOINTS } from "@/lib/constants";
import type {
	RouteApiResponse,
	RouteFeature,
	RouteFeatureCollection,
	ScoredRouteInfo,
} from "@/types/route";
import axios from "axios";

/** Full parsed result from the backend */
export interface ParsedRouteResult {
	geoJSON: RouteFeatureCollection;
	scoredRoutes: ScoredRouteInfo[];
	bestIndex: number;
}

/**
 * Fetch up to 3 routes from the backend, each with AQI data.
 */
export async function fetchBestRoute(
	startLat: number,
	startLon: number,
	endLat: number,
	endLon: number,
): Promise<ParsedRouteResult | null> {
	try {
		const response = await axios.post<RouteApiResponse>(
			ENDPOINTS.CLEAN_ROUTE,
			{
				start_lat: startLat,
				start_lon: startLon,
				end_lat: endLat,
				end_lon: endLon,
			},
			{
				timeout: 30000, // 30s — backend samples AQI for multiple routes
			},
		);

		if (!response.data?.routes?.length) return null;

		const scoredRoutes = parseAllRoutes(response.data);
		const geoJSON = buildGeoJSON(scoredRoutes);

		return {
			geoJSON,
			scoredRoutes,
			bestIndex: response.data.best_index,
		};
	} catch (error) {
		console.error("[routeService] Error fetching route:", error);
		return null;
	}
}

/**
 * Parse all routes from backend response into ScoredRouteInfo[].
 */
function parseAllRoutes(data: RouteApiResponse): ScoredRouteInfo[] {
	return data.routes.map((r) => ({
		index: r.index,
		isBest: r.is_best,
		avgPm25: r.avg_pm2_5,
		durationMin: r.duration_min,
		distanceKm: r.distance_km,
		geometry: r.geometry,
		aqiSamples: r.aqi_samples || [],
		googleMapsUrl: r.google_maps_url || "",
	}));
}

/**
 * Build GeoJSON FeatureCollection from all scored routes.
 */
function buildGeoJSON(routes: ScoredRouteInfo[]): RouteFeatureCollection {
	const features: RouteFeature[] = routes.map((r) => ({
		type: "Feature",
		properties: {
			isPrimary: r.isBest,
			routeIndex: r.index,
			pollution: r.avgPm25,
			duration: r.durationMin,
			distance: r.distanceKm,
		},
		geometry: r.geometry,
	}));

	return { type: "FeatureCollection", features };
}
