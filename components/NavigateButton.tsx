/**
 * NavigateButton — Opens Google Maps with the green route pre-loaded.
 * Generates a dynamic directions URL with intermediate waypoints.
 */

'use client';

import React from 'react';

interface NavigateButtonProps {
    googleMapsUrl: string;
}

const NavigateButton: React.FC<NavigateButtonProps> = ({ googleMapsUrl }) => {
    if (!googleMapsUrl) return null;

    return (
        <div className="absolute bottom-44 left-1/2 -translate-x-1/2 z-20">
            <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 px-5 py-3 rounded-full shadow-xl border border-gray-200 transition-all hover:shadow-2xl hover:scale-105 active:scale-95 font-medium text-sm group"
            >
                {/* Google Maps Icon */}
                <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                >
                    <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                        fill="#34A853"
                    />
                    <circle cx="12" cy="9" r="2.5" fill="white" />
                </svg>
                <span>Navigate in Google Maps</span>
                <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </a>
        </div>
    );
};

export default NavigateButton;
