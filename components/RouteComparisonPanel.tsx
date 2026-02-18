/**
 * RouteComparisonPanel — Shows all routes (up to 4) as selectable cards.
 * Mobile-first: collapsed by default, expandable via toggle button.
 * Each card shows: PM2.5, duration, distance, and a Google Maps link.
 *
 * FIXED: Badge logic now shows "Greenest" as relative label only,
 * and shows absolute AQI level only if PM2.5 > 75 (truly unhealthy).
 */

"use client";

import type { ScoredRouteInfo } from "@/types/route";
import React, { useState } from "react";

interface RouteComparisonPanelProps {
	routes: ScoredRouteInfo[];
	selectedIndex: number;
	onSelectRoute: (index: number) => void;
}

function getAbsoluteAQILevel(
	pm25: number,
	isBest: boolean
): { label: string; color: string } {
	if (isBest)
		return {
			label: "",
			color: ``,
		};
	if (pm25 > 75)
		return {
			label: "Unhealthy",
			color: ` bg-red-100 text-red-700 border-red-200 `,
		};
	if (pm25 > 35)
		return {
			label: "Moderate",
			color: "bg-yellow-100 text-yellow-700 border-yellow-200",
		};
	return {
		label: "Good",
		color: "bg-green-100 text-green-700 border-green-200",
	};
}

function getRelativeLabel(isBest: boolean): { label: string; color: string } {
	if (isBest) {
		return {
			label: "Greenest",
			color: "bg-emerald-100 text-emerald-700 border-emerald-200",
		};
	}
	return {
		label: "Alternative",
		color: "bg-gray-100 text-gray-700 border-gray-200",
	};
}

function getRouteLabel(index: number, isBest: boolean): string {
	if (isBest) return "🌿 Greenest Route";
	return `Route ${index + 1}`;
}

const RouteComparisonPanel: React.FC<RouteComparisonPanelProps> = ({
	routes,
	selectedIndex,
	onSelectRoute,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!routes.length) return null;

	const selected = routes[selectedIndex] || routes[0];

	return (
		<>
			{/* ─── Mobile: Compact bar + expandable drawer ─── */}
			<div className="md:hidden absolute top-4 left-2 right-2 z-20">
				{/* Compact summary bar */}
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-lg">🌿</span>
						<div className="text-left">
							<div className="text-xs font-semibold text-gray-800">
								{routes.length} route{routes.length > 1 ? "s" : ""} found
							</div>
							<div className="text-[10px] text-gray-500">
								Best: {selected.avgPm25.toFixed(1)} µg/m³ •{" "}
								{selected.durationMin.toFixed(0)} min
							</div>
						</div>
					</div>
					<svg
						className={`w-5 h-5 text-gray-400 transition-transform ${
							isExpanded ? "rotate-180" : ""
						}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{/* Expanded drawer */}
				{isExpanded && (
					<div className="mt-2 space-y-2 animate-in slide-in-from-top">
						{routes.map((route, idx) => (
							<RouteCard
								key={route.index}
								route={route}
								isSelected={idx === selectedIndex}
								onSelect={() => {
									onSelectRoute(idx);
									setIsExpanded(false);
								}}
							/>
						))}
					</div>
				)}
			</div>

			{/* ─── Desktop: Always-visible sidebar ─── */}
			<div className="hidden md:block absolute top-4 left-4 z-20 w-72 space-y-2">
				<div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-4 py-2.5">
					<h3 className="text-sm font-semibold text-gray-800">
						📊 {routes.length} Route{routes.length > 1 ? "s" : ""} Compared
					</h3>
				</div>
				{routes.map((route, idx) => (
					<RouteCard
						key={route.index}
						route={route}
						isSelected={idx === selectedIndex}
						onSelect={() => onSelectRoute(idx)}
					/>
				))}
			</div>
		</>
	);
};

// ─── Individual Route Card ──────────────────────────────────────

interface RouteCardProps {
	route: ScoredRouteInfo;
	isSelected: boolean;
	onSelect: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({
	route,
	isSelected,
	onSelect,
}) => {
	const relativeBadge = getRelativeLabel(route.isBest);
	const absoluteBadge = getAbsoluteAQILevel(route.avgPm25, route.isBest);

	return (
		<button
			onClick={onSelect}
			className={`w-full text-left bg-white/95 backdrop-blur-sm rounded-xl shadow-md border-2 transition-all hover:shadow-lg ${
				isSelected
					? "border-green-500 ring-2 ring-green-200"
					: "border-gray-200 hover:border-gray-300"
			} ${route.isBest ? "relative overflow-hidden" : ""}`}>
			{/* Best route badge label */}
			{route.isBest && (
				<div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
					GREENEST
				</div>
			)}

			<div className="p-3 space-y-2">
				{/* Header */}
				<div className="flex items-center justify-between">
					<span className="text-sm font-semibold text-gray-800">
						{getRouteLabel(route.index, route.isBest)}
					</span>
					<div className="flex items-center gap-1.5">
						<span
							className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${relativeBadge.color}`}>
							{relativeBadge.label}
						</span>
						<span
							className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${absoluteBadge.color}`}>
							{absoluteBadge.label}
						</span>
					</div>
				</div>

				{/* Stats grid */}
				<div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
					<div className="text-center">
						<div className="text-[10px] text-gray-400">PM2.5</div>
						<div className="text-xs font-bold text-gray-800">
							{route.avgPm25.toFixed(1)}
						</div>
						<div className="text-[8px] text-gray-400">µg/m³</div>
					</div>
					<div className="text-center border-x border-gray-200">
						<div className="text-[10px] text-gray-400">Time</div>
						<div className="text-xs font-bold text-gray-800">
							{route.durationMin.toFixed(0)}
						</div>
						<div className="text-[8px] text-gray-400">min</div>
					</div>
					<div className="text-center">
						<div className="text-[10px] text-gray-400">Dist</div>
						<div className="text-xs font-bold text-gray-800">
							{route.distanceKm.toFixed(1)}
						</div>
						<div className="text-[8px] text-gray-400">km</div>
					</div>
				</div>

				{/* Google Maps link */}
				{route.googleMapsUrl && (
					<a
						href={route.googleMapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
						className="flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg px-2 py-1.5 text-[11px] text-gray-600 hover:text-gray-800 transition-colors">
						<svg
							viewBox="0 0 24 24"
							className="w-3.5 h-3.5"
							fill="none">
							<path
								d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
								fill="#34A853"
							/>
							<circle
								cx="12"
								cy="9"
								r="2.5"
								fill="white"
							/>
						</svg>
						Open in Google Maps
						<svg
							className="w-3 h-3"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
					</a>
				)}
			</div>
		</button>
	);
};

export default RouteComparisonPanel;
