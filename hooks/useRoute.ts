/**
 * useRoute — Route fetching state machine.
 * Calls routeService when start + destination are both set.
 * Returns all discovered routes (target >=5) with per-route AQI data.
 *
 * States: idle → loading → success | error
 */

"use client";

import { fetchBestRoute } from "@/services/routeService";
import type { Coordinates } from "@/types/location";
import type {
	RouteFeatureCollection,
	RouteState,
	ScoredRouteInfo,
} from "@/types/route";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseRouteReturn {
	routeData: RouteFeatureCollection | null;
	routeState: RouteState;
	scoredRoutes: ScoredRouteInfo[];
	selectedIndex: number;
	setSelectedIndex: (i: number) => void;
	error: string | null;
	refetch: () => void;
}

export function useRoute(
	start: Coordinates | null,
	destination: Coordinates | null
): UseRouteReturn {
	const [routeData, setRouteData] = useState<RouteFeatureCollection | null>(
		null
	);
	const [routeState, setRouteState] = useState<RouteState>("idle");
	const [scoredRoutes, setScoredRoutes] = useState<ScoredRouteInfo[]>([]);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const lastRequestKeyRef = useRef<string | null>(null);
	const inFlightKeyRef = useRef<string | null>(null);

	const buildRequestKey = useCallback(
		(startCoords: Coordinates, destinationCoords: Coordinates): string => {
			const [startLon, startLat] = startCoords;
			const [endLon, endLat] = destinationCoords;
			return [startLon, startLat, endLon, endLat]
				.map((value) => value.toFixed(4))
				.join("|");
		},
		[]
	);

	const fetchRoute = useCallback(async () => {
		if (!start || !destination) {
			setRouteState("idle");
			return;
		}

		const requestKey = buildRequestKey(start, destination);
		if (inFlightKeyRef.current === requestKey) {
			return;
		}
		if (lastRequestKeyRef.current === requestKey && scoredRoutes.length > 0) {
			return;
		}

		inFlightKeyRef.current = requestKey;

		setRouteState("loading");
		setError(null);

		try {
			const result = await fetchBestRoute(
				start[1],
				start[0], // lat, lon
				destination[1],
				destination[0]
			);

			if (result) {
				setRouteData(result.geoJSON);
				setScoredRoutes(result.scoredRoutes);
				setSelectedIndex(result.bestIndex);
				setRouteState("success");
				lastRequestKeyRef.current = requestKey;
			} else {
				setRouteState("error");
				setError("No routes found between these locations.");
			}
		} catch (err) {
			setRouteState("error");
			setError(err instanceof Error ? err.message : "Failed to fetch route");
		} finally {
			inFlightKeyRef.current = null;
		}
	}, [buildRequestKey, destination, scoredRoutes.length, start]);

	useEffect(() => {
		fetchRoute();
	}, [fetchRoute]);

	return {
		routeData,
		routeState,
		scoredRoutes,
		selectedIndex,
		setSelectedIndex,
		error,
		refetch: fetchRoute,
	};
}
