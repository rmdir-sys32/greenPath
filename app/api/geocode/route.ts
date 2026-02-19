import { NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

// Helper to delay requests (Nominatim rate limit: 1 request per second)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q");
	const type = searchParams.get("type") || "search"; // 'search' or 'reverse'
	const lat = searchParams.get("lat");
	const lon = searchParams.get("lon");

	// Basic validation
	if (type === "search" && !query) {
		return NextResponse.json(
			{ error: "Missing query parameter" },
			{ status: 400 },
		);
	}
	if (type === "reverse" && (!lat || !lon)) {
		return NextResponse.json(
			{ error: "Missing lat/lon parameters" },
			{ status: 400 },
		);
	}

	try {
		let endpoint = NOMINATIM_URL;
		let params = new URLSearchParams({
			format: "json",
			addressdetails: "1",
			limit: searchParams.get("limit") || "5",
			"accept-language": "en",
		});

		if (type === "search") {
			params.set("q", query!);
			params.set("countrycodes", "in"); // Bias to India

			// Viewbox (optional)
			const viewbox = searchParams.get("viewbox");
			if (viewbox) {
				params.set("viewbox", viewbox);
				params.set("bounded", "0");
			}
		} else {
			endpoint = NOMINATIM_REVERSE_URL;
			params.set("lat", lat!);
			params.set("lon", lon!);
		}

		// Add a small delay to be polite to Nominatim
		await delay(500);

		const response = await fetch(`${endpoint}?${params.toString()}`, {
			headers: {
				"User-Agent": "Vayu/1.0 (contact: [EMAIL_ADDRESS])", // Required by Nominatim
				Referer: "http://localhost:3001",
			},
		});

		if (!response.ok) {
			console.error(
				`Nominatim API Error: ${response.status} ${response.statusText}`,
			);
			return NextResponse.json(
				{ error: "External API Error" },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Geocoding API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
