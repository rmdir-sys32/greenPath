/**
 * LoadingOverlay — Animated overlay while route is being calculated.
 */

'use client';

import React from 'react';

interface LoadingOverlayProps {
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    message = 'Finding the cleanest route...',
}) => {
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
            <div className="bg-white/95 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 max-w-xs">
                {/* Breathing Animation */}
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
                    <div className="absolute inset-1 rounded-full bg-green-400/50 animate-pulse" />
                    <div className="absolute inset-2.5 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-lg">🌿</span>
                    </div>
                </div>

                <p className="text-sm font-medium text-gray-700 text-center">{message}</p>
                <p className="text-xs text-gray-400">Analyzing air quality along routes</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
