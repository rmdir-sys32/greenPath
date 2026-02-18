/**
 * AQI Service — Fetches air quality data from OpenWeatherMap.
 * NO React. NO hooks. Pure async functions.
 */

import type { AirQualityResponse } from "@/types/airquality";

const OPENWEATHER_AQI_URL =
	"https://api.openweathermap.org/data/2.5/air_pollution";

/**
 * Fetch current air quality data for a specific coordinate.
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns AirQualityResponse or null on failure
 */
export async function fetchCurrentAQI(
	lat: number,
	lon: number,
): Promise<AirQualityResponse | null> {
	const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
	if (!apiKey) {
		console.warn("[aqiService] NEXT_PUBLIC_OPENWEATHER_API_KEY not set");
		return null;
	}

	try {
		const url = `${OPENWEATHER_AQI_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
		const res = await fetch(url);

		if (!res.ok) {
			console.error(`[aqiService] HTTP ${res.status}: ${res.statusText}`);
			return null;
		}

		const data = await res.json();
		return {
			coord: { lon, lat },
			list: data.list,
		};
	} catch (error) {
		console.error("[aqiService] Error fetching AQI:", error);
		return null;
	}
}

/**
 * Extract PM2.5 value from AQI response. Returns 0 if unavailable.
 */
export function extractPm25(data: AirQualityResponse | null): number {
	if (!data?.list?.[0]?.components?.pm2_5) return 0;
	return data.list[0].components.pm2_5;
}
