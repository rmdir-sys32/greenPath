/**
 * useUserLocation — GPS-based user location with manual override support.
 * Replaces the old utils/getUserLocation.tsx.
 *
 * Features:
 * - Uses watchPosition for continuous GPS updates
 * - Manual override pauses GPS tracking
 * - Reset to GPS mode clears manual override
 */

"use client";

import {
	DEFAULT_CENTER,
	GPS_MAX_AGE_MS,
	GPS_TIMEOUT_MS,
} from "@/lib/constants";
import type { Coordinates } from "@/types/location";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseUserLocationReturn {
	location: Coordinates | null;
	isManual: boolean;
	isLoading: boolean;
	error: string | null;
	setManualLocation: (coords: Coordinates) => void;
	resetToGPS: () => void;
}

export function useUserLocation(): UseUserLocationReturn {
	const [location, setLocation] = useState<Coordinates | null>(null);
	const [isManual, setIsManual] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const watchIdRef = useRef<number | null>(null);

	// Start GPS tracking
	useEffect(() => {
		if (!("geolocation" in navigator)) {
			setError("Geolocation not supported");
			setIsLoading(false);
			return;
		}

		const options: PositionOptions = {
			enableHighAccuracy: true,
			timeout: GPS_TIMEOUT_MS,
			maximumAge: GPS_MAX_AGE_MS,
		};

		const onSuccess = (position: GeolocationPosition) => {
			const { longitude, latitude } = position.coords;
			// Only update if NOT in manual mode
			if (!isManual) {
				setLocation([longitude, latitude]);
			}
			setIsLoading(false);
			setError(null);
		};

		const onError = (err: GeolocationPositionError) => {
			console.error("[useUserLocation] GPS error:", err.message);
			setError(err.message);
			setIsLoading(false);

			// Fallback to default location
			if (!isManual && !location) {
				setLocation(DEFAULT_CENTER);
			}
		};

		// Use getCurrentPosition for immediate result, then watch for updates
		navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
		watchIdRef.current = navigator.geolocation.watchPosition(
			onSuccess,
			onError,
			options,
		);

		return () => {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isManual]);

	/** Override GPS with a manually entered location */
	const setManualLocation = useCallback((coords: Coordinates) => {
		setIsManual(true);
		setLocation(coords);
		setError(null);
	}, []);

	/** Reset to GPS-based location tracking */
	const resetToGPS = useCallback(() => {
		setIsManual(false);
		setLocation(null); // Will be re-populated by watchPosition
		setIsLoading(true);
	}, []);

	return {
		location,
		isManual,
		isLoading,
		error,
		setManualLocation,
		resetToGPS,
	};
}
