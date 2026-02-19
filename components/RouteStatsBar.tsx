/**
 * RouteStatsBar — Compact stats bar at bottom of map.
 * Shows time, distance, PM2.5, inhalation dose, and cleanliness %.
 * Responsive: wraps on mobile, horizontal pill on desktop.
 */

'use client';

import type { RouteStats } from '@/types/route';
import { Activity, Clock, Leaf, Ruler, Wind } from 'lucide-react';
import React from 'react';

interface RouteStatsBarProps {
    stats: RouteStats;
    doseReduction: number;
    inhaledDose?: number;
}

const RouteStatsBar: React.FC<RouteStatsBarProps> = ({ stats, doseReduction, inhaledDose }) => {
    return (
        <div className="absolute bottom-[28vh] left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] md:w-auto transition-all duration-300">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 px-6 py-3 flex flex-wrap md:flex-nowrap items-center justify-center gap-3 md:gap-6">
                {/* Duration */}
                <div className="flex items-center gap-2 text-sm md:text-base">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                        {stats.durationMin.toFixed(0)} min
                    </span>
                </div>

                <div className="hidden md:block w-px h-5 bg-gray-200 dark:bg-gray-700" />

                {/* Distance */}
                <div className="flex items-center gap-2 text-sm md:text-base">
                    <Ruler className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {stats.distanceKm.toFixed(1)} km
                    </span>
                </div>

                <div className="hidden md:block w-px h-5 bg-gray-200 dark:bg-gray-700" />

                {/* PM2.5 */}
                <div className="flex items-center gap-2 text-sm md:text-base">
                    <Wind className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {stats.avgPm25.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">µg/m³</span>
                </div>

                {/* Inhalation Dose */}
                {inhaledDose !== undefined && inhaledDose > 0 && (
                    <>
                        <div className="hidden md:block w-px h-5 bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center gap-2 text-sm md:text-base">
                            <Activity className="w-4 h-4 text-orange-500" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {inhaledDose.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">µg</span>
                        </div>
                    </>
                )}

                {doseReduction > 0 && (
                    <>
                        <div className="hidden md:block w-px h-5 bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center gap-2 text-sm md:text-base bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full border border-green-100 dark:border-green-800">
                            <Leaf className="w-4 h-4 text-green-600 dark:text-green-400 fill-current" />
                            <span className="text-green-700 dark:text-green-400 font-bold">
                                {doseReduction.toFixed(0)}% cleaner
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RouteStatsBar;
