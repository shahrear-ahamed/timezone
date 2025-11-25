import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { useState } from "react";

export default function LocationDetector() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = () => {
    setLoading(true);
    setError(null);
    setAddress(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // Fetch address using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setAddress(data.display_name);
        } catch (err) {
          console.error("Error fetching address:", err);
        }

        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen from-blue-50 to-indigo-100 bg-linear-to-br">
      <div className="p-8 w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="mb-6 text-center">
          <div className="inline-flex justify-center items-center mb-4 w-16 h-16 bg-indigo-100 rounded-full">
            <MapPin className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            Location Detector
          </h1>
          <p className="text-gray-600">Detect your current browser location</p>
        </div>

        <button
          onClick={detectLocation}
          disabled={loading}
          className="flex gap-2 justify-center items-center px-6 py-3 w-full font-semibold text-white bg-indigo-600 rounded-lg transition-colors duration-200 hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5" />
              Detect My Location
            </>
          )}
        </button>

        {error && (
          <div className="flex gap-3 items-start p-4 mt-6 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="mt-0.5 w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {location && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="mb-2 font-semibold text-green-800">Coordinates</h3>
              <div className="space-y-1 text-sm">
                <p className="text-green-700">
                  <span className="font-medium">Latitude:</span>{" "}
                  {location.latitude.toFixed(6)}
                </p>
                <p className="text-green-700">
                  <span className="font-medium">Longitude:</span>{" "}
                  {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>

            {address && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="mb-2 font-semibold text-blue-800">Address</h3>
                <p className="text-sm text-blue-700">{address}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-xs text-center text-gray-500">
          Your browser will ask for permission to access your location
        </div>
      </div>
    </div>
  );
}
