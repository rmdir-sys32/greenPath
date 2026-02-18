/**
 * SearchBar — Unified start/destination search with autocomplete.
 * Consumes useGeocoder hook for debounced results.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeocoder } from "@/hooks/useGeocoder";
import { getCoordinatesForQuery } from "@/services/geocodingService";
import type { Coordinates, GeocodingResult } from "@/types/location";
import React, { useState } from "react";

interface SearchBarProps {
	onStartChange: (coords: Coordinates) => void;
	onDestinationChange: (coords: Coordinates) => void;
	onResetGPS: () => void;
	isManualStart: boolean;
	userLocation: Coordinates | null;
}

type ActiveField = "start" | "destination" | null;

const SearchBar: React.FC<SearchBarProps> = ({
	onStartChange,
	onDestinationChange,
	onResetGPS,
	isManualStart,
	userLocation,
}) => {
	const [startInput, setStartInput] = useState("");
	const [destInput, setDestInput] = useState("");
	const [activeField, setActiveField] = useState<ActiveField>(null);

	const { results, isSearching, search, clear } = useGeocoder(userLocation);

	// Handle autocomplete selection
	const handleSelect = (result: GeocodingResult) => {
		const selectedLabel =
			result.displayLabel || result.placeName || result.text;
		if (activeField === "start") {
			setStartInput(selectedLabel);
			onStartChange(result.center);
		} else if (activeField === "destination") {
			setDestInput(selectedLabel);
			onDestinationChange(result.center);
		}
		clear();
		setActiveField(null);
	};

	// Handle "Enter" key fallback (if no autocomplete selected)
	const handleStartSearch = async () => {
		if (!startInput.trim()) return;
		const coords = await getCoordinatesForQuery(
			startInput,
			userLocation ?? undefined
		);
		if (coords) onStartChange(coords);
		clear();
		setActiveField(null);
	};

	const handleDestSearch = async () => {
		if (!destInput.trim()) return;
		const coords = await getCoordinatesForQuery(
			destInput,
			userLocation ?? undefined
		);
		if (coords) onDestinationChange(coords);
		clear();
		setActiveField(null);
	};

	const handleStartInputChange = (value: string) => {
		setStartInput(value);
		setActiveField("start");
		if (value === "") {
			onResetGPS();
			clear();
		} else {
			search(value);
		}
	};

	const handleDestInputChange = (value: string) => {
		setDestInput(value);
		setActiveField("destination");
		if (value === "") {
			clear();
		} else {
			search(value);
		}
	};

	return (
		<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-11/12 md:w-2/5 flex flex-col gap-2">
			{/* Autocomplete Dropdown */}
			{results.length > 0 && activeField && (
				<div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
					{isSearching && (
						<div className="px-4 py-2 text-xs text-gray-400 text-center">
							Searching...
						</div>
					)}
					{results.map((result, index) => (
						<button
							key={index}
							onClick={() => handleSelect(result)}
							className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors">
							<div className="font-medium leading-tight">{result.text}</div>
							{result.secondaryText && (
								<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
									{result.secondaryText}
								</div>
							)}
						</button>
					))}
				</div>
			)}

			{/* Start Location */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow" />
					<Input
						className="bg-white/95 backdrop-blur-sm text-black placeholder:text-gray-400 pl-8 border-gray-200 shadow-lg"
						placeholder={
							isManualStart ? "Custom start location" : "📍 Using GPS location"
						}
						value={startInput}
						onChange={(e) => handleStartInputChange(e.target.value)}
						onFocus={() => setActiveField("start")}
						onKeyDown={(e) => e.key === "Enter" && handleStartSearch()}
					/>
				</div>
				{isManualStart && (
					<Button
						onClick={() => {
							setStartInput("");
							onResetGPS();
							clear();
						}}
						variant="outline"
						className="bg-white/90 text-xs shadow-lg"
						title="Reset to GPS">
						📍
					</Button>
				)}
			</div>

			{/* Destination */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white shadow" />
					<Input
						className="bg-gray-900/95 backdrop-blur-sm text-white placeholder:text-gray-400 pl-8 border-gray-700 shadow-lg"
						placeholder="Enter destination..."
						value={destInput}
						onChange={(e) => handleDestInputChange(e.target.value)}
						onFocus={() => setActiveField("destination")}
						onKeyDown={(e) => e.key === "Enter" && handleDestSearch()}
					/>
				</div>
				<Button
					onClick={handleDestSearch}
					className="bg-green-600 hover:bg-green-700 text-white shadow-lg font-semibold">
					🌿 Go
				</Button>
			</div>
		</div>
	);
};

export default SearchBar;
