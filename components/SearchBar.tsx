"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeocoder } from "@/hooks/useGeocoder";
import { getCoordinatesForQuery } from "@/services/geocodingService";
import type { Coordinates, GeocodingResult } from "@/types/location";
import { MapPin, Navigation } from "lucide-react";
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
		<div className="absolute bottom-0 left-0 w-full h-[25vh] z-20 flex flex-col justify-center gap-4 bg-white   rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-6 md:px-20 py-6 border-t border-gray-100  ">

			{/* Autocomplete Dropdown - Floating above */}
			{results.length > 0 && activeField && (
				<div className="absolute bottom-[26vh] left-6 right-6 md:left-20 md:right-20 bg-white   rounded-xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto z-30">
					{isSearching && (
						<div className="px-6 py-4 text-sm text-gray-500 text-center font-medium">
							Searching locations...
						</div>
					)}
					{results.map((result, index) => (
						<button
							key={index}
							onClick={() => handleSelect(result)}
							className="w-full text-left px-6 py-4 hover:bg-blue-50   text-base md:text-lg text-gray-900  border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3">
							<MapPin className="w-5 h-5 text-gray-400 shrink-0" />
							<div>
								<div className="font-semibold">{result.text}</div>
								{result.secondaryText && (
									<div className="text-sm text-gray-500 mt-1">
										{result.secondaryText}
									</div>
								)}
							</div>
						</button>
					))}
				</div>
			)}

			{/* Start Location Input Row */}
			<div className="flex gap-4 items-center">
				<div className="relative flex-1">
					<div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
					<Input
						className="h-14 md:h-16 text-lg md:text-xl   pl-12 rounded-2xl focus-visible:ring-blue-500 shadow-sm transition-all"
						placeholder={
							isManualStart
								? "Enter start location"
								: `Current Location (${userLocation?.[1].toFixed(4)}, ${userLocation?.[0].toFixed(4)})`
						}
						value={startInput}
						onChange={(e) => handleStartInputChange(e.target.value)}
						onFocus={() => setActiveField("start")}
						onKeyDown={(e) => e.key === "Enter" && handleStartSearch()}
					/>
				</div>

				<Button
					onClick={() => {
						setStartInput("");
						onResetGPS();
						clear();
					}}
					variant="outline"
					className="h-14 md:h-16 px-6 rounded-2xl border-gray-200   hover:bg-blue-50   text-blue-600  font-medium text-base shadow-sm"
					title="Use Current Location">
					<MapPin className="w-5 h-5 mr-2" />
					Current
				</Button>
			</div>

			{/* Destination Input Row */}
			<div className="flex gap-4 items-center">
				<div className="relative flex-1">
					<div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
					<Input
						className="h-14 md:h-16 text-lg md:text-xl bg-gray-50  border-gray-200   pl-12 rounded-2xl focus-visible:ring-red-500 shadow-sm transition-all"
						placeholder="Where to?"
						value={destInput}
						onChange={(e) => handleDestInputChange(e.target.value)}
						onFocus={() => setActiveField("destination")}
						onKeyDown={(e) => e.key === "Enter" && handleDestSearch()}
					/>
				</div>
				<Button
					onClick={handleDestSearch}
					className="h-14 md:h-16 px-8 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg shadow-green-600/20 transition-all hover:scale-105 active:scale-95">
					<Navigation className="w-5 h-5 mr-2 fill-current" />
					Go
				</Button>
			</div>
		</div>
	);
};

export default SearchBar;
