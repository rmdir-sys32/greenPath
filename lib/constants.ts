/**
 * Application-wide constants. Single source of truth for API URLs,
 * default configurations, and scientific parameters.
 */

import { TransportMode } from "@/types/health";

// ─── API Configuration ────────────────────────────────────────────
export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export const ENDPOINTS = {
	CLEAN_ROUTE: `${API_BASE_URL}/get-clean-route`,
	SCORE_ROUTES: `${API_BASE_URL}/score-routes`,
	HEALTH_CHECK: `${API_BASE_URL}/health`,
} as const;

// ─── Mapbox Configuration ─────────────────────────────────────────
export const MAPBOX_GEOCODING_URL =
	"https://api.mapbox.com/geocoding/v5/mapbox.places";
export const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v12";

export const DEFAULT_CENTER: [number, number] = [80.92313, 26.83928]; // Lucknow
export const DEFAULT_ZOOM = 12;

// ─── Breathing Rates (m³/hour) — EPA Reference ───────────────────
export const BREATHING_RATES: Record<TransportMode, number> = {
	[TransportMode.DRIVING]: 0.6,
	[TransportMode.CYCLING]: 2.5,
	[TransportMode.WALKING]: 1.5,
};

// ─── Pareto Scoring Weights ──────────────────────────────────────
export const DEFAULT_WEIGHTS = {
	exposure: 0.6,
	time: 0.3,
	distance: 0.1,
} as const;

export const VULNERABLE_WEIGHTS = {
	exposure: 0.9,
	time: 0.08,
	distance: 0.02,
} as const;

// ─── AQI Thresholds & Colors ─────────────────────────────────────
export const AQI_LEVELS = [
	{ max: 1, label: "Good", color: "#00e400", bg: "rgba(0, 228, 0, 0.15)" },
	{ max: 2, label: "Fair", color: "#ffff00", bg: "rgba(255, 255, 0, 0.15)" },
	{
		max: 3,
		label: "Moderate",
		color: "#ff7e00",
		bg: "rgba(255, 126, 0, 0.15)",
	},
	{ max: 4, label: "Poor", color: "#ff0000", bg: "rgba(255, 0, 0, 0.15)" },
	{
		max: 5,
		label: "Very Poor",
		color: "#8f3f97",
		bg: "rgba(143, 63, 151, 0.15)",
	},
] as const;

// ─── Route Display Colors ────────────────────────────────────────
export const ROUTE_COLORS = {
	primary: "#22c55e", // Green — best route
	alternative: "#94a3b8", // Gray — other routes
	primaryWidth: 6,
	alternativeWidth: 4,
	opacity: 0.8,
} as const;

// ─── Timing Constants ────────────────────────────────────────────
export const GEOCODER_DEBOUNCE_MS = 300;
export const AQI_REFRESH_INTERVAL_MS = 30_000; // 30 seconds
export const GPS_TIMEOUT_MS = 15_000;
export const GPS_MAX_AGE_MS = 10_000;
