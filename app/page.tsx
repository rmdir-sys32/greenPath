'use client'
import Map from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserLocation } from "@/utils/getUserLocation";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // userLocation is now [number, number] | null
  const { userLocation } = getUserLocation();
  const destination = [81.0983169, 26.951515];

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // 📱 Mobile Keyboard Logic: Unfocus when "Back" button is pressed
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.visualViewport) {
        // If viewport height > 80% of screen, keyboard is closed
        if (window.visualViewport.height > window.innerHeight * 0.8) {
          setIsFocused(false);
          inputRef.current?.blur();
        }
      }
    };

    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== "undefined" && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <main className="relative z-10 flex flex-col items-center w-screen h-[100dvh] mx-auto my-auto overflow-hidden">

      <div className='relative flex flex-col -z-10 w-full h-full md:w-4/5 md:h-4/5 border-black bg-gray-200 my-auto md:border rounded-xl shadow-xl overflow-hidden'>

        {/* Pass array directly to Map */}
        <Map userLocation={userLocation} destination={destination} />

        {/* Display Coordinates (Array Indexing) */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2 px-3 rounded-lg text-xs font-mono shadow-sm z-10 border border-gray-200">
          📍 {userLocation ? `${userLocation[1].toFixed(4)}, ${userLocation[0].toFixed(4)}` : "Locating..."}
        </div>

        {/* <AirQualityCard data={DEFAULT_DATA} /> */}

        {/* 📱 Dynamic Input Box */}
        <div
          className={`
            absolute left-1/2 -translate-x-1/2 z-20 w-full flex justify-center 
            transition-all duration-300 ease-out
            /* Mobile: Move to 40% from bottom if focused */
            ${isFocused ? 'bottom-[40%]' : 'bottom-6'} 
            /* PC: Always bottom-6 */
            md:bottom-6
          `}
        >
          <div className="flex w-11/12 md:w-1/3 gap-2 bg-white p-2 rounded-xl shadow-2xl">
            <Input
              ref={inputRef}
              className="relative bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus-visible:ring-offset-0"
              placeholder="Enter Destination"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Go</Button>
          </div>
        </div>

      </div>
    </main>
  );
}