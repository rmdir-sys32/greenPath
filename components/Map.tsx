/**
 * Map — Pure display component for Mapbox GL.
 * Receives data as props. Contains ZERO business logic or API calls.
 *
 * Props:
 * - userLocation: blue marker
 * - destination: red marker
 * - routeGeoJSON: route lines to render (with per-segment gradient)
 * - aqiSamples: colored circles along the route showing PM2.5
 */

'use client';

import {
    DEFAULT_CENTER,
    DEFAULT_ZOOM,
    MAPBOX_STYLE,
    MAPBOX_TOKEN,
    ROUTE_COLORS,
} from '@/lib/constants';
import type { Coordinates } from '@/types/location';
import type { AQISamplePoint, RouteFeatureCollection } from '@/types/route';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef, useState } from 'react';

interface MapProps {
    userLocation: Coordinates | null;
    destination: Coordinates | null;
    routeGeoJSON: RouteFeatureCollection | null;
    aqiSamples?: AQISamplePoint[];
}

/** Get color for a PM2.5 value: green → yellow → orange → red */
function getAQIColor(pm25: number): string {
    if (pm25 <= 15) return '#22c55e';   // Green — Good
    if (pm25 <= 35) return '#eab308';   // Yellow — Moderate
    if (pm25 <= 75) return '#f97316';   // Orange — Unhealthy for sensitive
    return '#ef4444';                     // Red — Unhealthy
}

/** Get radius for a PM2.5 value (higher = bigger circle) */
function getAQIRadius(pm25: number): number {
    if (pm25 <= 15) return 8;
    if (pm25 <= 35) return 10;
    if (pm25 <= 75) return 12;
    return 14;
}

const Map: React.FC<MapProps> = ({ userLocation, destination, routeGeoJSON, aqiSamples }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const popupRef = useRef<mapboxgl.Popup | null>(null);

    const [viewState] = useState({
        lng: DEFAULT_CENTER[0],
        lat: DEFAULT_CENTER[1],
        zoom: DEFAULT_ZOOM,
    });

    // 1. Initialize Map (once)
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: MAPBOX_STYLE,
            center: [viewState.lng, viewState.lat],
            zoom: viewState.zoom,
            attributionControl: false,
        });

        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Handle User Location Marker
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (userLocation) {
            if (userMarkerRef.current) userMarkerRef.current.remove();

            userMarkerRef.current = new mapboxgl.Marker({ color: '#3b82f6' })
                .setLngLat(userLocation)
                .addTo(map);

            if (!destination) {
                map.flyTo({ center: userLocation, zoom: 14 });
            }
        }
    }, [userLocation, destination]);

    // 3. Handle Destination Marker
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !destination) return;

        if (destMarkerRef.current) destMarkerRef.current.remove();

        destMarkerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
            .setLngLat(destination)
            .addTo(map);

        // Fit bounds if both markers exist
        if (userLocation) {
            const bounds = new mapboxgl.LngLatBounds()
                .extend(userLocation)
                .extend(destination);
            map.fitBounds(bounds, { padding: 80 });
        }
    }, [userLocation, destination]);

    // 4. Handle Route GeoJSON Layer
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const renderRoute = () => {
            if (!routeGeoJSON) return;

            const source = map.getSource('routes') as mapboxgl.GeoJSONSource;

            if (source) {
                source.setData(routeGeoJSON as any);
            } else {
                map.addSource('routes', {
                    type: 'geojson',
                    data: routeGeoJSON as any,
                });

                map.addLayer({
                    id: 'route-lines',
                    type: 'line',
                    source: 'routes',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': [
                            'case',
                            ['boolean', ['get', 'isPrimary'], false],
                            ROUTE_COLORS.primary,
                            ROUTE_COLORS.alternative,
                        ],
                        'line-width': [
                            'case',
                            ['boolean', ['get', 'isPrimary'], false],
                            ROUTE_COLORS.primaryWidth,
                            ROUTE_COLORS.alternativeWidth,
                        ],
                        'line-opacity': ROUTE_COLORS.opacity,
                    },
                });
            }
        };

        if (map.isStyleLoaded()) {
            renderRoute();
        } else {
            map.once('load', renderRoute);
        }
    }, [routeGeoJSON]);

    // 5. Handle AQI Sample Markers along route
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !aqiSamples?.length) return;

        const renderAQIMarkers = () => {
            // Build GeoJSON for AQI sample points
            const aqiGeoJSON: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: aqiSamples.map((sample, i) => ({
                    type: 'Feature' as const,
                    properties: {
                        pm25: sample.pm2_5,
                        color: getAQIColor(sample.pm2_5),
                        radius: getAQIRadius(sample.pm2_5),
                        label: `${sample.pm2_5.toFixed(1)} µg/m³`,
                        index: i,
                    },
                    geometry: {
                        type: 'Point' as const,
                        coordinates: [sample.lon, sample.lat],
                    },
                })),
            };

            const source = map.getSource('aqi-samples') as mapboxgl.GeoJSONSource;

            if (source) {
                source.setData(aqiGeoJSON);
            } else {
                map.addSource('aqi-samples', {
                    type: 'geojson',
                    data: aqiGeoJSON,
                });

                // Outer glow circle
                map.addLayer({
                    id: 'aqi-glow',
                    type: 'circle',
                    source: 'aqi-samples',
                    paint: {
                        'circle-radius': ['get', 'radius'],
                        'circle-color': ['get', 'color'],
                        'circle-opacity': 0.25,
                        'circle-blur': 0.8,
                    },
                });

                // Inner solid circle  
                map.addLayer({
                    id: 'aqi-dots',
                    type: 'circle',
                    source: 'aqi-samples',
                    paint: {
                        'circle-radius': 5,
                        'circle-color': ['get', 'color'],
                        'circle-opacity': 0.9,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                    },
                });

                // PM2.5 value label
                map.addLayer({
                    id: 'aqi-labels',
                    type: 'symbol',
                    source: 'aqi-samples',
                    layout: {
                        'text-field': ['get', 'label'],
                        'text-size': 10,
                        'text-offset': [0, -1.5],
                        'text-anchor': 'bottom',
                        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
                    },
                    paint: {
                        'text-color': '#374151',
                        'text-halo-color': '#ffffff',
                        'text-halo-width': 1.5,
                    },
                });

                // Hover popup
                map.on('mouseenter', 'aqi-dots', (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    const feature = e.features?.[0];
                    if (!feature) return;

                    const coords = (feature.geometry as GeoJSON.Point).coordinates;
                    const pm25 = feature.properties?.pm25;
                    const level = pm25 <= 15 ? 'Good' : pm25 <= 35 ? 'Moderate' : pm25 <= 75 ? 'Unhealthy (Sensitive)' : 'Unhealthy';

                    if (popupRef.current) popupRef.current.remove();
                    popupRef.current = new mapboxgl.Popup({ closeButton: false, offset: 15 })
                        .setLngLat(coords as [number, number])
                        .setHTML(`
							<div style="font-family: Inter, sans-serif; padding: 4px;">
								<div style="font-weight: 600; font-size: 13px;">PM2.5: ${pm25} µg/m³</div>
								<div style="font-size: 11px; color: #666; margin-top: 2px;">${level}</div>
							</div>
						`)
                        .addTo(map);
                });

                map.on('mouseleave', 'aqi-dots', () => {
                    map.getCanvas().style.cursor = '';
                    if (popupRef.current) {
                        popupRef.current.remove();
                        popupRef.current = null;
                    }
                });
            }
        };

        if (map.isStyleLoaded()) {
            renderAQIMarkers();
        } else {
            map.once('load', renderAQIMarkers);
        }
    }, [aqiSamples]);

    return <div ref={mapContainerRef} className="w-full h-full rounded-xl" />;
};

export default Map;