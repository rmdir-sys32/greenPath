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
 * @param selectedRouteStats - Stats of the currently selected route
 * @param referenceDurationMin - Duration of the reference route (usually greenest)
 * @param referencePm25 - PM2.5 of the reference route (usually greenest)
 * @param isVulnerable - Whether user has vulnerable mode enabled
 * @param transportMode - Current transport mode
 */
export function useHealthScore(
	selectedRouteStats: RouteStats | null,
	referenceDurationMin: number = 0,
	referencePm25: number = 0,
	isVulnerable: boolean = false,
	transportMode: TransportMode = TransportMode.DRIVING
): UseHealthScoreReturn {
	const result = useMemo(() => {
		if (!selectedRouteStats) {
			return {
				exposureScore: null,
				doseReduction: 0,
				isVulnerableWarning: false,
			};
		}

		const selectedDose = estimateSimpleExposure(
			selectedRouteStats.avgPm25,
			selectedRouteStats.durationMin,
			transportMode
		);

		const referenceDose =
			referenceDurationMin > 0 && referencePm25 > 0
				? estimateSimpleExposure(
						referencePm25,
						referenceDurationMin,
						transportMode
				  )
				: selectedDose;

		const reduction = calculateDoseReduction(selectedDose, referenceDose);

		const exposureScore: ExposureScore = {
			totalDose: selectedDose,
			doseReduction: reduction,
			segmentScores: [], // Simplified — no per-segment data from current backend
			transportMode,
		};

		return {
			exposureScore,
			doseReduction: reduction,
			isVulnerableWarning: isVulnerable && selectedRouteStats.avgPm25 > 100,
		};
	}, [
		selectedRouteStats,
		referenceDurationMin,
		referencePm25,
		isVulnerable,
		transportMode,
	]);

	return result;
}
