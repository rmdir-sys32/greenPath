/**
 * RouteStatsBar — Compact stats bar at bottom of map.
 * Shows time, distance, PM2.5, inhalation dose, and cleanliness %.
 * Responsive: wraps on mobile, horizontal pill on desktop.
 */

'use client';

import type { RouteStats } from '@/types/route';
import React from 'react';

interface RouteStatsBarProps {
    stats: RouteStats;
    doseReduction: number;
    inhaledDose?: number;
}

const RouteStatsBar: React.FC<RouteStatsBarProps> = ({ stats, doseReduction, inhaledDose }) => {
    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] md:w-auto">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl md:rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-4 py-2 flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-4">
                {/* Duration */}
                <div className="flex items-center gap-1 text-xs md:text-sm">
                    <span className="text-gray-400">🕐</span>
                    <span className="font-semibold text-gray-800">
                        {stats.durationMin.toFixed(0)} min
                    </span>
                </div>

                <div className="hidden md:block w-px h-4 bg-gray-200" />

                {/* Distance */}
                <div className="flex items-center gap-1 text-xs md:text-sm">
                    <span className="text-gray-400">📏</span>
                    <span className="font-semibold text-gray-800">
                        {stats.distanceKm.toFixed(1)} km
                    </span>
                </div>

                <div className="hidden md:block w-px h-4 bg-gray-200" />

                {/* PM2.5 */}
                <div className="flex items-center gap-1 text-xs md:text-sm">
                    <span className="text-gray-400">💨</span>
                    <span className="font-semibold text-gray-800">
                        {stats.avgPm25.toFixed(1)}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-gray-400">µg/m³</span>
                </div>

                {/* Inhalation Dose */}
                {inhaledDose !== undefined && inhaledDose > 0 && (
                    <>
                        <div className="hidden md:block w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1 text-xs md:text-sm">
                            <span className="text-gray-400">🫁</span>
                            <span className="font-semibold text-gray-800">
                                {inhaledDose.toFixed(1)}
                            </span>
                            <span className="text-[9px] md:text-[10px] text-gray-400">µg</span>
                        </div>
                    </>
                )}

                {doseReduction > 0 && (
                    <>
                        <div className="hidden md:block w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1 text-xs md:text-sm">
                            <span className="text-green-600 font-bold">
                                🌿 {doseReduction.toFixed(0)}%
                            </span>
                            <span className="hidden md:inline text-green-600 font-bold">cleaner</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RouteStatsBar;
