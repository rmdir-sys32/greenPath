/**
 * Geocoding Service — Uses OpenStreetMap Nominatim API.
 * Better coverage for Indian localities than Mapbox Geocoding.
 * NO React. NO hooks. Pure async functions.
 */

import type { Coordinates, GeocodingResult } from "@/types/location";

const GEOCODE_API_URL = "/api/geocode";

interface NominatimAddress {
	city?: string;
	town?: string;
	village?: string;
	county?: string;
	state_district?: string;
	state?: string;
	country?: string;
	postcode?: string;
}

interface NominatimSearchItem {
	place_id: number | string;
	display_name: string;
	lon: string;
	lat: string;
	importance?: number | string;
	address?: NominatimAddress;
}

function buildPrimaryAndSecondary(item: NominatimSearchItem): {
	primary: string;
	secondary: string;
	displayLabel: string;
} {
	const fallbackParts = item.display_name
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean);

	const primary = fallbackParts[0] || item.display_name;
	const locality =
		item.address?.city ||
		item.address?.town ||
		item.address?.village ||
		item.address?.county ||
		"";
	const state = item.address?.state || item.address?.state_district || "";
	const country = item.address?.country || "";

	const preferredSecondary = [locality, state, country]
		.filter(Boolean)
		.join(", ");
	const secondary = preferredSecondary || fallbackParts.slice(1, 4).join(", ");
	const displayLabel = secondary ? `${primary}, ${secondary}` : primary;

	return { primary, secondary, displayLabel };
}

/**
 * Forward geocode: convert a text query into coordinates.
 * Uses local API route to proxy to Nominatim (avoids CORS).
 */
export async function geocodeAddress(
	query: string,
	limit: number = 5,
	proximity?: Coordinates
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

		return (data as NominatimSearchItem[]).map((item) => {
			const labels = buildPrimaryAndSecondary(item);
			return {
				id: String(item.place_id),
				placeName: item.display_name,
				center: [parseFloat(item.lon), parseFloat(item.lat)] as Coordinates,
				relevance: parseFloat(String(item.importance ?? "0.5")) || 0.5,
				text: labels.primary,
				secondaryText: labels.secondary,
				displayLabel: labels.displayLabel,
			};
		});
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
	proximity?: Coordinates
): Promise<Coordinates | null> {
	const results = await geocodeAddress(query, 1, proximity);
	return results.length > 0 ? results[0].center : null;
}

/**
 * Reverse geocode: convert coordinates to a place name.
 */
export async function reverseGeocode(
	coords: Coordinates
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
