/**
 * PollutionChart — Mini horizontal bar chart showing PM2.5 at each sample
 * point along the route. Pure CSS bars, no chart library needed.
 */

'use client';

import type { AQISamplePoint } from '@/types/route';
import React from 'react';

interface PollutionChartProps {
    samples: AQISamplePoint[];
}

/** Get color for a PM2.5 value */
function getBarColor(pm25: number): string {
    if (pm25 <= 15) return 'bg-green-500';
    if (pm25 <= 35) return 'bg-yellow-400';
    if (pm25 <= 75) return 'bg-orange-500';
    return 'bg-red-500';
}

function getLabel(pm25: number): string {
    if (pm25 <= 15) return 'Good';
    if (pm25 <= 35) return 'Moderate';
    if (pm25 <= 75) return 'Unhealthy (S)';
    return 'Unhealthy';
}

const PollutionChart: React.FC<PollutionChartProps> = ({ samples }) => {
    if (!samples.length) return null;

    const maxPm25 = Math.max(...samples.map((s) => s.pm2_5), 50); // Min scale of 50

    return (
        <div className="absolute bottom-4 right-4 z-20 w-64 hidden md:block">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        📊 PM2.5 Along Route
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{samples.length} sample points</p>
                </div>

                <div className="p-3 space-y-1.5">
                    {samples.map((sample, i) => {
                        const widthPct = Math.max(5, (sample.pm2_5 / maxPm25) * 100);
                        return (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-400 w-4 text-right font-mono">
                                    {i + 1}
                                </span>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(sample.pm2_5)}`}
                                        style={{ width: `${widthPct}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-semibold text-gray-700 w-8 text-right">
                                    {sample.pm2_5.toFixed(0)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="px-3 pb-2.5 flex flex-wrap gap-2">
                    {[
                        { color: 'bg-green-500', label: '≤15 Good' },
                        { color: 'bg-yellow-400', label: '≤35 Mod' },
                        { color: 'bg-orange-500', label: '≤75 UH(S)' },
                        { color: 'bg-red-500', label: '>75 UH' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-[8px] text-gray-500">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PollutionChart;
