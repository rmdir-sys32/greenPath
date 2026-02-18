/**
 * HealthExposureWidget — Visual exposure dose comparison.
 * Shows "You'll breathe X% less pollution" with animated bar.
 */

'use client';

import type { ExposureScore } from '@/types/health';
import React from 'react';

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

    const isPositive = doseReduction > 0;
    const barWidth = Math.min(Math.abs(doseReduction), 100);

    return (
        <div className="hidden md:block absolute top-4 right-4 z-20 w-72">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Vulnerable Warning Banner */}
                {isVulnerableWarning && (
                    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
                        <p className="text-xs text-amber-800 font-semibold flex items-center gap-1.5">
                            ⚠️ High PM2.5 — Consider postponing travel
                        </p>
                    </div>
                )}

                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        🫁 Health Exposure
                    </h3>
                </div>

                {/* Dose Reduction */}
                <div className="px-4 py-3">
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-500'
                            }`}>
                            {isPositive ? '↓' : '↑'}{Math.abs(doseReduction).toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                            {isPositive ? 'less pollution' : 'more pollution'}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${isPositive ? 'bg-green-500' : 'bg-red-400'
                                }`}
                            style={{ width: `${barWidth}%` }}
                        />
                    </div>

                    {/* Dose Details */}
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-2.5">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide block">Estimated Dose</span>
                            <span className="text-sm font-semibold text-gray-800">
                                {exposureScore.totalDose.toFixed(1)} µg
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide block">Transport</span>
                            <span className="text-sm font-semibold text-gray-800">
                                {exposureScore.transportMode === 'DRIVING' ? '🚗' :
                                    exposureScore.transportMode === 'CYCLING' ? '🚴' : '🚶'}
                                {' '}{exposureScore.transportMode.toLowerCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthExposureWidget;
