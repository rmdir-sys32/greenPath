/**
 * useHealthScore — Calculates exposure score from route data.
 * Bridges lib/exposure.ts (pure math) with React state.
 */

"use client";

import { calculateDoseReduction, estimateSimpleExposure } from "@/lib/exposure";
import type { ExposureScore } from "@/types/health";
import { TransportMode } from "@/types/health";
import type { RouteStats } from "@/types/route";
import { useMemo } from "react";

interface UseHealthScoreReturn {
	exposureScore: ExposureScore | null;
	doseReduction: number; // percentage (0-100)
	isVulnerableWarning: boolean; // true if avg PM2.5 > 100 in vulnerable mode
}

/**
 * @param bestRouteStats - Stats of the green (best) route
 * @param defaultDurationMin - Duration of the default/fastest route (for comparison)
 * @param defaultPm25 - PM2.5 of the default route (for comparison)
 * @param isVulnerable - Whether user has vulnerable mode enabled
 * @param transportMode - Current transport mode
 */
export function useHealthScore(
	bestRouteStats: RouteStats | null,
	defaultDurationMin: number = 0,
	defaultPm25: number = 0,
	isVulnerable: boolean = false,
	transportMode: TransportMode = TransportMode.DRIVING,
): UseHealthScoreReturn {
	const result = useMemo(() => {
		if (!bestRouteStats) {
			return {
				exposureScore: null,
				doseReduction: 0,
				isVulnerableWarning: false,
			};
		}

		// Calculate dose for the green route
		const greenDose = estimateSimpleExposure(
			bestRouteStats.avgPm25,
			bestRouteStats.durationMin,
			transportMode,
		);

		// Calculate dose for the default route (if available)
		const defaultDose =
			defaultDurationMin > 0 && defaultPm25 > 0
				? estimateSimpleExposure(defaultPm25, defaultDurationMin, transportMode)
				: greenDose * 1.2; // Estimate: default is ~20% worse if unknown

		const reduction = calculateDoseReduction(greenDose, defaultDose);

		const exposureScore: ExposureScore = {
			totalDose: greenDose,
			doseReduction: reduction,
			segmentScores: [], // Simplified — no per-segment data from current backend
			transportMode,
		};

		return {
			exposureScore,
			doseReduction: reduction,
			isVulnerableWarning: isVulnerable && bestRouteStats.avgPm25 > 100,
		};
	}, [
		bestRouteStats,
		defaultDurationMin,
		defaultPm25,
		isVulnerable,
		transportMode,
	]);

	return result;
}
