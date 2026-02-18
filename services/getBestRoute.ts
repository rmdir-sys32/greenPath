import axios from "axios";

export const getBestRoute = async (
	startLat: number,
	startLon: number,
	endLat: number,
	endLon: number,
) => {
	try {
		const response = await axios.post("http://localhost:8001/get-clean-route", {
			start_lat: startLat,
			start_lon: startLon,
			end_lat: endLat,
			end_lon: endLon,
		});
		if (!response) throw new Error("No response from server");
		return parseRouteResponse(response.data);
	} catch (error) {
		console.error("Error fetching best route:", error);
		throw error;
	}
};

export const parseRouteResponse = (data: any) => {
	if (!data || !data.best_route) return null;

	// 1. Create the "Winner" (Green Path)
	const bestRouteFeature = {
		type: "Feature",
		properties: {
			isPrimary: true, // Used for coloring
			pollution: data.stats.avg_pm2_5,
			duration: data.stats.duration_min,
			distance: data.stats.distance_km,
		},
		geometry: data.best_route.geometry, // The coordinates list
	};

	// 2. Create the "Losers" (Gray Paths)
	const alternativeFeatures = data.alternatives.map((route: any) => ({
		type: "Feature",
		properties: {
			isPrimary: false,
			duration: Math.round(route.duration / 60),
		},
		geometry: route.geometry,
	}));

	// 3. Return as a FeatureCollection
	return {
		type: "FeatureCollection",
		features: [bestRouteFeature, ...alternativeFeatures],
	};
};
// This file is deprecated — use services/routeService.ts instead.
