/**
 * useGeocoder — Debounced geocoding hook for autocomplete.
 * Calls Mapbox Geocoding API after 300ms of typing inactivity.
 */

"use client";

import { GEOCODER_DEBOUNCE_MS } from "@/lib/constants";
import { geocodeAddress } from "@/services/geocodingService";
import type { Coordinates, GeocodingResult } from "@/types/location";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseGeocoderReturn {
	results: GeocodingResult[];
	isSearching: boolean;
	search: (query: string) => void;
	clear: () => void;
}

export function useGeocoder(proximity?: Coordinates | null): UseGeocoderReturn {
	const [results, setResults] = useState<GeocodingResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	const search = useCallback((query: string) => {
		// Clear previous timer
		if (debounceRef.current) clearTimeout(debounceRef.current);

		if (!query.trim()) {
			setResults([]);
			setIsSearching(false);
			return;
		}

		setIsSearching(true);

		// Debounce the API call
		debounceRef.current = setTimeout(async () => {
			try {
				const geocodeResults = await geocodeAddress(
					query,
					5,
					proximity ?? undefined,
				);
				setResults(geocodeResults);
			} catch {
				setResults([]);
			} finally {
				setIsSearching(false);
			}
		}, GEOCODER_DEBOUNCE_MS);
	}, []);

	const clear = useCallback(() => {
		setResults([]);
		setIsSearching(false);
		if (debounceRef.current) clearTimeout(debounceRef.current);
	}, []);

	return { results, isSearching, search, clear };
}
