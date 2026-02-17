export const getRoute = async (
	start: [number, number],
	end: [number, number],
) => {
	const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
	if (!token) throw new Error("Mapbox token not found");

	const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&alternatives=true&geometries=geojson&access_token=${token}`;

	try {
		const response = await fetch(url);
		const json = await response.json();

		// console.log("JSON", json);

		if (json.code === "NoSegment" || json.routes.length === 0) {
			console.error("Mapbox Error:", json.message);
			return null;
		}

		const routes = json.routes.map((route: any, index: number) => {
			return {
				type: "Feature",
				properties: {
					isPrimary: index === 0,
				},
				geometry: {
					type: "LineString",
					coordinates: route.geometry.coordinates,
				},
			};
		});

		return {
			type: "FeatureCollection",
			features: routes,
		};
	} catch (error) {
		console.error("Error fetching route", error);
		return null;
	}
};
