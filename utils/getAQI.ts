import axios from "axios";

export const getAQI = () => {
	const NEXT_PUBLIC_OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "";
	if (!NEXT_PUBLIC_OPENWEATHER_API_KEY)
		throw new Error("OpenWeather API key not found");

	const getAQI_data = async ({ lat, long }: { lat: number; long: number }) => {
		try {
			const response = await axios.get(
				`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${NEXT_PUBLIC_OPENWEATHER_API_KEY}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching AQI data:", error);
			return null;
		}
	};

	return {
		getAQI_data,
	};
};
