/**
 * AQIInfoButton — Collapsible air quality card.
 * Default: just an ℹ️ info button. Click to expand full AQI details.
 */

'use client';

import { AQI_LEVELS } from '@/lib/constants';
import type { AirQualityResponse } from '@/types/airquality';
import React, { useState } from 'react';

interface AQIInfoButtonProps {
    data: AirQualityResponse | null;
    isLoading?: boolean;
}

const AQIInfoButton: React.FC<AQIInfoButtonProps> = ({ data, isLoading }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <button className="absolute top-4 right-2 md:right-4 z-20 w-10 h-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center animate-pulse">
                <span className="text-lg">ℹ️</span>
            </button>
        );
    }

    if (!data?.list?.length) return null;

    const { main, components } = data.list[0];
    const { aqi } = main;
    const { pm2_5, pm10, o3, no2 } = components;

    const level = AQI_LEVELS.find((l) => l.max >= aqi) || AQI_LEVELS[AQI_LEVELS.length - 1];

    if (!isExpanded) {
        // Collapsed: just an info button
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="absolute top-4 right-2 md:right-4 z-20 w-10 h-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Show air quality info"
            >
                <span className="text-lg">ℹ️</span>
            </button>
        );
    }

    // Expanded: full card
    return (
        <div className="absolute top-4 right-2 md:right-4 z-20 w-56 md:w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header with close button */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Air Quality</h3>
                <div className="flex items-center gap-2">
                    <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full border dark:border-gray-600"
                        style={{
                            backgroundColor: level.bg,
                            color: aqi === 2 ? '#333' : level.color,
                            borderColor: level.color,
                        }}
                    >
                        AQI {aqi}/5 • {level.label}
                    </span>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Pollutant Grid */}
            <div className="grid grid-cols-2 gap-2 p-3">
                <PollutantItem label="PM2.5" value={pm2_5} unit="µg/m³" isHigh={pm2_5 > 15} />
                <PollutantItem label="PM10" value={pm10} unit="µg/m³" isHigh={pm10 > 45} />
                <PollutantItem label="Ozone" value={o3} unit="µg/m³" isHigh={o3 > 100} />
                <PollutantItem label="NO₂" value={no2} unit="µg/m³" isHigh={no2 > 25} />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    📍 {data.coord ? `${data.coord.lat.toFixed(4)}°N, ${data.coord.lon.toFixed(4)}°E` : 'Current location'}
                </p>
            </div>
        </div>
    );
};

const PollutantItem = ({
    label,
    value,
    unit,
    isHigh,
}: {
    label: string;
    value: number;
    unit: string;
    isHigh: boolean;
}) => (
    <div
        className={`bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border-l-[3px] ${isHigh ? 'border-red-400' : 'border-green-400'
            }`}
    >
        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {value.toFixed(1)} <span className="text-[9px] font-normal text-gray-400 dark:text-gray-500">{unit}</span>
        </div>
    </div>
);

export default AQIInfoButton;
