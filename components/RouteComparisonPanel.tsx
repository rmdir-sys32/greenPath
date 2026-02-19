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
import { BarChart2, ChevronDown, ExternalLink, Leaf, MapPin } from "lucide-react";
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
			color: ` bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 `,
		};
	if (pm25 > 35)
		return {
			label: "Moderate",
			color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
		};
	return {
		label: "Good",
		color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
	};
}

function getRelativeLabel(isBest: boolean): { label: string; color: string } {
	if (isBest) {
		return {
			label: "Greenest",
			color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
		};
	}
	return {
		label: "Alternative",
		color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
	};
}

function RouteLabel({ index, isBest }: { index: number; isBest: boolean }) {
	if (isBest) {
		return (
			<span className="flex items-center gap-1.5">
				<Leaf className="w-4 h-4 text-green-600 dark:text-green-400 fill-current" />
				Greenest Route
			</span>
		);
	}
	return <span>Route {index + 1}</span>;
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
					className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Leaf className="w-5 h-5 text-green-500 fill-current" />
						<div className="text-left">
							<div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
								{routes.length} route{routes.length > 1 ? "s" : ""} found
							</div>
							<div className="text-[10px] text-gray-500 dark:text-gray-400">
								Best: {selected.avgPm25.toFixed(1)} µg/m³ •{" "}
								{selected.durationMin.toFixed(0)} min
							</div>
						</div>
					</div>
					<ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
				</button>

				{/* Expanded drawer */}
				{isExpanded && (
					<div className="mt-2 space-y-2 animate-in slide-in-from-top bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl">
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
				<div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 px-4 py-2.5">
					<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
						<BarChart2 className="w-4 h-4 text-gray-500" />
						{routes.length} Route{routes.length > 1 ? "s" : ""} Compared
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
			className={`w-full text-left bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-md border-2 transition-all hover:shadow-lg ${isSelected
					? "border-green-500 ring-2 ring-green-200 dark:ring-green-900/50"
					: "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
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
					<span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
						<RouteLabel index={route.index} isBest={route.isBest} />
					</span>
					<div className="flex items-center gap-1.5">
						<span
							className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${relativeBadge.color}`}>
							{relativeBadge.label}
						</span>
						{absoluteBadge.label && (
							<span
								className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${absoluteBadge.color}`}>
								{absoluteBadge.label}
							</span>
						)}
					</div>
				</div>

				{/* Stats grid */}
				<div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1.5 border border-gray-100 dark:border-gray-700">
					<div className="text-center">
						<div className="text-[10px] text-gray-400 uppercase">PM2.5</div>
						<div className="text-xs font-bold text-gray-800 dark:text-gray-100">
							{route.avgPm25.toFixed(1)}
						</div>
						<div className="text-[8px] text-gray-400">µg/m³</div>
					</div>
					<div className="text-center border-x border-gray-200 dark:border-gray-700">
						<div className="text-[10px] text-gray-400 uppercase">Time</div>
						<div className="text-xs font-bold text-gray-800 dark:text-gray-100">
							{route.durationMin.toFixed(0)}
						</div>
						<div className="text-[8px] text-gray-400">min</div>
					</div>
					<div className="text-center">
						<div className="text-[10px] text-gray-400 uppercase">Dist</div>
						<div className="text-xs font-bold text-gray-800 dark:text-gray-100">
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
						className="flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1.5 text-[11px] text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors border border-gray-100 dark:border-gray-700">
						<MapPin className="w-3.5 h-3.5 text-green-600" />
						Open in Google Maps
						<ExternalLink className="w-3 h-3 text-gray-400" />
					</a>
				)}
			</div>
		</button>
	);
};

export default RouteComparisonPanel;
