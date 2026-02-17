"use client";

import { getRoute } from '@/utils/getRoute';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';

interface MapProps {
    userLocation: [number, number] | null;
    destination: [number, number] | null;
}

const Map = ({ userLocation, destination }: MapProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    // Refs to track marker instances so we can remove them later
    const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const destMarkerRef = useRef<mapboxgl.Marker | null>(null);

    // Default Center (Lucknow)
    const [viewState] = useState({
        lng: userLocation ? userLocation[0] : 81.098317,
        lat: userLocation ? userLocation[1] : 26.951515,
        zoom: 12
    });

    // 1. Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapRef.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [viewState.lng, viewState.lat],
            zoom: viewState.zoom,
            attributionControl: false,
        });

        // Add Zoom Controls
        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []); // Runs once on mount

    // 2. Handle User Location & Destination Updates
    useEffect(() => {
        if (!mapRef.current) return;

        // --- A. Handle User Marker ---
        if (userLocation) {
            const [lng, lat] = userLocation;

            // Remove old user marker to prevent duplicates
            if (userMarkerRef.current) userMarkerRef.current.remove();

            // Create new User Marker (Blue)
            userMarkerRef.current = new mapboxgl.Marker({ color: '#3b82f6' }) // Blue
                .setLngLat([lng, lat])
                .addTo(mapRef.current);

            // Only fly to user if we don't have a destination yet
            if (!destination) {
                mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
            }
        }

        // --- B. Handle Destination Marker & Route ---
        const updateRouteAndDestination = async () => {
            if (!userLocation || !destination) return;

            // Remove old destination marker
            if (destMarkerRef.current) destMarkerRef.current.remove();

            // Create new Destination Marker (Red)
            destMarkerRef.current = new mapboxgl.Marker({ color: '#ef4444' }) // Red
                .setLngLat(destination)
                .addTo(mapRef.current);

            // Fit map to show both points
            const bounds = new mapboxgl.LngLatBounds()
                .extend(userLocation)
                .extend(destination);

            mapRef.current?.fitBounds(bounds, { padding: 50 });

            // Fetch Route using the PROPS (not hardcoded values)
            const routeGeoJSON = await getRoute(userLocation, destination);

            if (mapRef.current && routeGeoJSON) {
                const source = mapRef.current.getSource('routes') as mapboxgl.GeoJSONSource;

                if (source) {
                    // Update existing source
                    source.setData(routeGeoJSON as any);
                } else {
                    // Add new source and layer
                    mapRef.current.addSource('routes', {
                        type: 'geojson',
                        data: routeGeoJSON as any
                    });
                    mapRef.current.addLayer({
                        id: 'route-lines',
                        type: 'line',
                        source: 'routes',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: {
                            'line-color': ['case', ['boolean', ['get', 'isPrimary'], false], '#22c55e', '#94a3b8'],
                            'line-width': ['case', ['boolean', ['get', 'isPrimary'], false], 6, 4],
                            'line-opacity': 0.8
                        }
                    });
                }
            }
        };

        // Trigger logic if map style is loaded
        if (destination) {
            if (mapRef.current.isStyleLoaded()) {
                updateRouteAndDestination();
            } else {
                mapRef.current.once('load', updateRouteAndDestination);
            }
        }

    }, [userLocation, destination]); // ⚠️ Re-run when either location changes

    return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default Map;