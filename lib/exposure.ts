/**
 * Cumulative Exposure Model (CEM) — Pure calculation functions.
 * Based on EPA's exposure equation: Exposure = Σ [ C(i) × BR × T(i) ]
 *
 * NO React. NO side effects. Pure math.
 */

import {
	TransportMode,
	type ExposureScore,
	type SegmentExposure,
} from "@/types/health";
import { BREATHING_RATES } from "./constants";

/**
 * Calculate inhaled dose for a single route segment.
 *
 * @param pm25 - PM2.5 concentration at segment (µg/m³)
 * @param durationHours - Time spent traversing segment (hours)
 * @param mode - Transport mode (affects breathing rate)
 * @returns SegmentExposure with calculated dose
 */
export function calculateSegmentExposure(
	pm25: number,
	durationHours: number,
	mode: TransportMode,
): SegmentExposure {
	const breathingRate = BREATHING_RATES[mode];
	const dose = pm25 * breathingRate * durationHours;

	return {
		pm25,
		durationHours,
		dose: Math.round(dose * 100) / 100, // 2 decimal places
	};
}

/**
 * Calculate total exposure for an entire route.
 *
 * @param segments - Array of segment exposures
 * @param mode - Transport mode
 * @returns ExposureScore with total dose and segment breakdown
 */
export function calculateRouteExposure(
	segments: SegmentExposure[],
	mode: TransportMode,
): ExposureScore {
	const totalDose = segments.reduce((sum, seg) => sum + seg.dose, 0);

	return {
		totalDose: Math.round(totalDose * 100) / 100,
		doseReduction: 0, // Set externally via calculateDoseReduction
		segmentScores: segments,
		transportMode: mode,
	};
}

/**
 * Calculate percentage reduction in exposure dose between two routes.
 *
 * @param greenDose - Total dose on the recommended (green) route
 * @param defaultDose - Total dose on the default (fastest) route
 * @returns Percentage reduction (0-100). Negative if green is worse.
 */
export function calculateDoseReduction(
	greenDose: number,
	defaultDose: number,
): number {
	if (defaultDose === 0) return 0;
	const reduction = ((defaultDose - greenDose) / defaultDose) * 100;
	return Math.round(reduction * 10) / 10; // 1 decimal place
}

/**
 * Estimate exposure from simplified route data (avg PM2.5 + duration).
 * Used when we don't have per-segment data — a reasonable approximation.
 *
 * @param avgPm25 - Average PM2.5 along the route (µg/m³)
 * @param durationMin - Total route duration (minutes)
 * @param mode - Transport mode
 * @returns Estimated total dose (µg)
 */
export function estimateSimpleExposure(
	avgPm25: number,
	durationMin: number,
	mode: TransportMode = TransportMode.DRIVING,
): number {
	const durationHours = durationMin / 60;
	const breathingRate = BREATHING_RATES[mode];
	return Math.round(avgPm25 * breathingRate * durationHours * 100) / 100;
}
