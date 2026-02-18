/**
 * Health & Exposure Types — Used for the Cumulative Exposure Model.
 */

/** Transport mode affects breathing rate (m³/hour) */
export enum TransportMode {
	DRIVING = "DRIVING",
	CYCLING = "CYCLING",
	WALKING = "WALKING",
}

/** Exposure score for a single route segment */
export interface SegmentExposure {
	pm25: number; // µg/m³ at this segment
	durationHours: number; // time spent in this segment
	dose: number; // calculated: pm25 × breathingRate × duration
}

/** Overall exposure score for a complete route */
export interface ExposureScore {
	totalDose: number; // total µg inhaled
	doseReduction: number; // percentage saved vs. default route (0-100)
	segmentScores: SegmentExposure[];
	transportMode: TransportMode;
}

/** User health profile for vulnerability mode */
export interface HealthProfile {
	isVulnerable: boolean; // asthma, elderly, etc.
	transportMode: TransportMode;
}
