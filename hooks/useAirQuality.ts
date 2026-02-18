/**
 * useAirQuality — Periodic AQI fetching for the user's current location.
 * Refreshes every 30 seconds.
 */

"use client";

import { AQI_REFRESH_INTERVAL_MS } from "@/lib/constants";
import { fetchCurrentAQI } from "@/services/aqiService";
import type { AirQualityResponse } from "@/types/airquality";
import type { Coordinates } from "@/types/location";
import { useCallback, useEffect, useState } from "react";

interface UseAirQualityReturn {
	aqiData: AirQualityResponse | null;
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useAirQuality(
	location: Coordinates | null,
): UseAirQualityReturn {
	const [aqiData, setAqiData] = useState<AirQualityResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchAQI = useCallback(async () => {
		if (!location) return;

		setIsLoading(true);
		setError(null);

		try {
			// location is [lng, lat]
			const data = await fetchCurrentAQI(location[1], location[0]);
			if (data) {
				setAqiData(data);
			} else {
				setError("Failed to fetch AQI data");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "AQI fetch failed");
		} finally {
			setIsLoading(false);
		}
	}, [location]);

	// Fetch on mount and when location changes
	useEffect(() => {
		fetchAQI();
	}, [fetchAQI]);

	// Periodic refresh
	useEffect(() => {
		if (!location) return;

		const interval = setInterval(fetchAQI, AQI_REFRESH_INTERVAL_MS);
		return () => clearInterval(interval);
	}, [location, fetchAQI]);

	return { aqiData, isLoading, error, refetch: fetchAQI };
}
