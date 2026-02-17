export interface AirQualityItem {
	main: {
		aqi: number;
	};
	components: {
		co: number;
		no: number;
		no2: number;
		o3: number;
		so2: number;
		pm2_5: number;
		pm10: number;
		nh3: number;
	};
	dt: number;
}

export interface AirQualityResponse {
	coord: {
		lon: number;
		lat: number;
	};
	list: AirQualityItem[];
}

export const DEFAULT_DATA: AirQualityResponse = {
	coord: { lon: 81.0983, lat: 26.9515 },
	list: [
		{
			main: { aqi: 4 },
			components: {
				co: 315.1,
				no: 0.4,
				no2: 5.04,
				o3: 112.91,
				so2: 6.82,
				pm2_5: 56.17,
				pm10: 81.43,
				nh3: 19.92,
			},
			dt: 1771327636,
		},
	],
};
