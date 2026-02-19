/**
 * HealthExposureWidget — Visual exposure dose comparison.
 * Shows "You'll breathe X% less pollution" with animated bar.
 */

"use client";

import type { ExposureScore } from "@/types/health";
import { Activity, AlertTriangle, ArrowDown, ArrowRight, ArrowUp, Bike, Car, Footprints } from "lucide-react";
import React from "react";

interface HealthExposureWidgetProps {
	exposureScore: ExposureScore | null;
	doseReduction: number;
	isVulnerableWarning: boolean;
}

const HealthExposureWidget: React.FC<HealthExposureWidgetProps> = ({
	exposureScore,
	doseReduction,
	isVulnerableWarning,
}) => {
	if (!exposureScore) return null;

	const isNeutral = Math.abs(doseReduction) < 0.05;
	const isPositive = doseReduction > 0;
	const barWidth = isNeutral ? 0 : Math.min(Math.abs(doseReduction), 100);

	return (
		<div className="hidden md:block absolute top-4 right-4 z-20 w-72">
			<div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
				{/* Vulnerable Warning Banner */}
				{isVulnerableWarning && (
					<div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
						<p className="text-xs text-amber-800 dark:text-amber-200 font-semibold flex items-center gap-1.5">
							<AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
							High PM2.5 — Consider postponing travel
						</p>
					</div>
				)}

				{/* Header */}
				<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
					<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
						<Activity className="w-4 h-4 text-pink-500" />
						Health Exposure
					</h3>
				</div>

				{/* Dose Reduction */}
				<div className="px-4 py-3">
					<div className="flex items-baseline gap-1 mb-2">
						<div className={`flex items-center gap-1 text-2xl font-bold ${isNeutral
								? "text-gray-600 dark:text-gray-400"
								: isPositive
									? "text-green-600 dark:text-green-400"
									: "text-red-500 dark:text-red-400"
							}`}>
							{isNeutral ? (
								<ArrowRight className="w-6 h-6" />
							) : isPositive ? (
								<ArrowDown className="w-6 h-6" />
							) : (
								<ArrowUp className="w-6 h-6" />
							)}
							{Math.abs(doseReduction).toFixed(1)}%
						</div>
						<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
							{isNeutral
								? "same as greenest route"
								: isPositive
									? "less pollution"
									: "more pollution"}
						</span>
					</div>

					{/* Progress Bar */}
					<div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
						<div
							className={`h-full rounded-full transition-all duration-700 ease-out ${isPositive ? "bg-green-500" : "bg-red-400"
								}`}
							style={{ width: `${barWidth}%` }}
						/>
					</div>

					{/* Dose Details */}
					<div className="mt-3 grid grid-cols-2 gap-3">
						<div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
							<span className="text-[10px] text-gray-400 uppercase tracking-wide block mb-1">
								Estimated Dose
							</span>
							<span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
								{exposureScore.totalDose.toFixed(1)} µg
							</span>
						</div>
						<div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
							<span className="text-[10px] text-gray-400 uppercase tracking-wide block mb-1">
								Transport
							</span>
							<div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
								{exposureScore.transportMode === "DRIVING" ? (
									<Car className="w-3.5 h-3.5 text-blue-500" />
								) : exposureScore.transportMode === "CYCLING" ? (
									<Bike className="w-3.5 h-3.5 text-orange-500" />
								) : (
									<Footprints className="w-3.5 h-3.5 text-green-500" />
								)}
								<span className="capitalize">{exposureScore.transportMode.toLowerCase()}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HealthExposureWidget;
