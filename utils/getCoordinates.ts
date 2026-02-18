export const getCoordinates = async (
	query: string,
): Promise<[number, number] | null> => {
	const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
	if (!query || !token) return null;

	const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`;

	try {
		const res = await fetch(url);
		const data = await res.json();
		if (data.features && data.features.length > 0) {
			return data.features[0].center; // Returns [lng, lat]
		}
		return null;
	} catch (err) {
		console.error("Geocoding failed:", err);
		return null;
	}
};
