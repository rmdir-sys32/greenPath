/**
 * Location Types — Coordinates, geocoding results, and location state.
 */

/** [longitude, latitude] — Mapbox/GeoJSON standard order */
export type Coordinates = [number, number];

/** A single geocoding result from Mapbox Geocoding API */
export interface GeocodingResult {
	id: string;
	placeName: string;
	center: Coordinates;
	relevance: number;
	text: string;
	secondaryText: string;
	displayLabel: string;
}

/** State for location-related hooks */
export interface LocationState {
	location: Coordinates | null;
	isManual: boolean;
	isLoading: boolean;
	error: string | null;
}
