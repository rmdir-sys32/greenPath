/**
 * Route Types — All interfaces related to routing and route scoring.
 * Used across services, hooks, and components.
 */

/** State machine for async route fetching */
export type RouteState = "idle" | "loading" | "success" | "error";

/** A sampled AQI point along a route */
export interface AQISamplePoint {
	lat: number;
	lon: number;
	pm2_5: number;
}

/** Individual scored route from the backend (returned for ALL routes) */
export interface ScoredRouteInfo {
	index: number;
	isBest: boolean;
	avgPm25: number;
	durationMin: number;
	distanceKm: number;
	geometry: GeoJSON.Geometry;
	aqiSamples: AQISamplePoint[];
	googleMapsUrl: string;
}

/** Raw backend response */
export interface RouteApiResponse {
	routes: Array<{
		index: number;
		is_best: boolean;
		avg_pm2_5: number;
		duration_min: number;
		distance_km: number;
		geometry: GeoJSON.Geometry;
		aqi_samples: AQISamplePoint[];
		google_maps_url: string;
	}>;
	best_index: number;
}

/** A single route as a GeoJSON Feature (for Mapbox rendering) */
export interface RouteFeature {
	type: "Feature";
	properties: {
		isPrimary: boolean;
		routeIndex: number;
		pollution?: number;
		duration?: number;
		distance?: number;
	};
	geometry: GeoJSON.Geometry;
}

/** Parsed route data as a GeoJSON FeatureCollection */
export interface RouteFeatureCollection {
	type: "FeatureCollection";
	features: RouteFeature[];
}

/** Stats for a single route */
export interface RouteStats {
	avgPm25: number;
	durationMin: number;
	distanceKm: number;
}
