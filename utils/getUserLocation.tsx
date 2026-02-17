'use client'
import { useEffect, useState } from "react";

const getUserLocation = () => {
    // State stores [Longitude, Latitude] to match Mapbox format
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 1. Check if browser supports Geolocation
        if (!("geolocation" in navigator)) {
            setError("Geolocation not supported");
            return;
        }

        // 2. Define Options (Vital for Mobile)
        const options = {
            enableHighAccuracy: true, // Tries to use GPS instead of IP
            timeout: 15000,           // Wait 15 seconds before timing out
            maximumAge: 10000,        // Accept a cached position if it's < 10s old
        };

        const success = (position: GeolocationPosition) => {
            const { longitude, latitude } = position.coords;
            console.log("User Location Found:", longitude, latitude);
            setUserLocation([longitude, latitude]);
            setError(null);
        };

        const handleError = (err: GeolocationPositionError) => {
            console.error("Error getting location:", err.message, "Code:", err.code);
            setError(err.message);
            setUserLocation([81.026616, 26.874779]);
        };

        // 3. Call the API with options
        navigator.geolocation.getCurrentPosition(success, handleError, options);
        return () => {
            console.log("ok")
        }
    }, []);

    return {
        userLocation,
        setUserLocation,
        error
    };
}

export { getUserLocation };
