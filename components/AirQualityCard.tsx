/**
 * AirQualityCard — Displays current location AQI with pollutant breakdown.
 * Refactored to use Tailwind classes instead of inline styles.
 */

'use client';

import { AQI_LEVELS } from '@/lib/constants';
import type { AirQualityResponse } from '@/types/airquality';
import React from 'react';

interface AirQualityCardProps {
    data: AirQualityResponse | null;
    isLoading?: boolean;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="absolute top-4 right-4 z-20 w-72 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-gray-100 rounded-lg" />
                        <div className="h-12 bg-gray-100 rounded-lg" />
                        <div className="h-12 bg-gray-100 rounded-lg" />
                        <div className="h-12 bg-gray-100 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!data?.list?.length) return null;

    const { main, components } = data.list[0];
    const { aqi } = main;
    const { pm2_5, pm10, o3, no2 } = components;

    const level = AQI_LEVELS.find((l) => l.max >= aqi) || AQI_LEVELS[AQI_LEVELS.length - 1];

    return (
        <div className="absolute top-4 right-2 md:right-4 z-20 w-56 md:w-72 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Air Quality</h3>
                <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{
                        backgroundColor: level.bg,
                        color: aqi === 2 ? '#333' : level.color,
                        borderColor: level.color,
                    }}
                >
                    AQI {aqi}/5 • {level.label}
                </span>
            </div>

            {/* Pollutant Grid */}
            <div className="grid grid-cols-2 gap-2 p-3">
                <PollutantItem label="PM2.5" value={pm2_5} unit="µg/m³" isHigh={pm2_5 > 15} />
                <PollutantItem label="PM10" value={pm10} unit="µg/m³" isHigh={pm10 > 45} />
                <PollutantItem label="Ozone" value={o3} unit="µg/m³" isHigh={o3 > 100} />
                <PollutantItem label="NO₂" value={no2} unit="µg/m³" isHigh={no2 > 25} />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-gray-500">
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
    <div className={`bg-gray-50 p-2.5 rounded-lg border-l-[3px] ${isHigh ? 'border-red-400' : 'border-green-400'
        }`}>
        <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-semibold text-gray-800">
            {value.toFixed(1)} <span className="text-[9px] font-normal text-gray-400">{unit}</span>
        </div>
    </div>
);

export default AirQualityCard;