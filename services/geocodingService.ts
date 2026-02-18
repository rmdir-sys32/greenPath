/**
 * Geocoding Service — Uses OpenStreetMap Nominatim API.
 * Better coverage for Indian localities than Mapbox Geocoding.
 * NO React. NO hooks. Pure async functions.
 */

import type { Coordinates, GeocodingResult } from "@/types/location";

const GEOCODE_API_URL = "/api/geocode";

/**
 * Forward geocode: convert a text query into coordinates.
 * Uses local API route to proxy to Nominatim (avoids CORS).
 */
export async function geocodeAddress(
	query: string,
	limit: number = 5,
	proximity?: Coordinates,
): Promise<GeocodingResult[]> {
	if (!query.trim()) return [];

	const params = new URLSearchParams({
		type: "search",
		q: query,
		limit: String(limit),
	});

	// Add proximity bias via viewbox (checked on server side if viewbox param exists)
	if (proximity) {
		const [lng, lat] = proximity;
		params.set("viewbox", `${lng - 1},${lat - 1},${lng + 1},${lat + 1}`);
	}

	try {
		const res = await fetch(`${GEOCODE_API_URL}?${params.toString()}`);
		if (!res.ok) return [];

		const data = await res.json();
		if (!data?.length) return [];

		return data.map((item: any) => ({
			id: String(item.place_id),
			placeName: item.display_name,
			center: [parseFloat(item.lon), parseFloat(item.lat)] as Coordinates,
			relevance: parseFloat(item.importance) || 0.5,
			text: item.display_name.split(",")[0], // First part = main name
		}));
	} catch (error) {
		console.error("[geocodingService] Error:", error);
		return [];
	}
}

/**
 * Get the single best coordinate for a query.
 */
export async function getCoordinatesForQuery(
	query: string,
	proximity?: Coordinates,
): Promise<Coordinates | null> {
	const results = await geocodeAddress(query, 1, proximity);
	return results.length > 0 ? results[0].center : null;
}

/**
 * Reverse geocode: convert coordinates to a place name.
 */
export async function reverseGeocode(
	coords: Coordinates,
): Promise<string | null> {
	try {
		const params = new URLSearchParams({
			type: "reverse",
			lat: String(coords[1]),
			lon: String(coords[0]),
		});

		const res = await fetch(`${GEOCODE_API_URL}?${params.toString()}`);
		if (!res.ok) return null;

		const data = await res.json();
		return data?.display_name || null;
	} catch (error) {
		console.error("[geocodingService] Reverse geocode error:", error);
		return null;
	}
}
