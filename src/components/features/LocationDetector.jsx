import { useCallback, useEffect, useRef, useState } from "react";

const formatCoordinate = (value) =>
  typeof value === "number" ? value.toFixed(4) : "—";

const reverseGeocode = async (latitude, longitude) => {
  const params = new URLSearchParams({
    latitude,
    longitude,
    localityLanguage: "en",
  });

  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const data = await response.json();

  return {
    city:
      data.city || data.locality || data.principalSubdivision || "Unknown city",
    country: data.countryName || "Unknown country",
  };
};

function LocationDetector() {
  const [status, setStatus] = useState("idle");
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const attemptsRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const requestLocationRef = useRef(null);

  const clearPendingRetry = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Geolocation is not supported in this browser.");
      return;
    }

    attemptsRef.current += 1;
    setStatus("locating");
    setErrorMessage("");
    setAddress(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        attemptsRef.current = 0;
        clearPendingRetry();
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setStatus("resolving");
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          attemptsRef.current = 0;
          clearPendingRetry();
          setErrorMessage("Location permission denied.");
          setStatus("denied");
          return;
        }

        const autoRetryLimit = 3;
        const friendlyMessage =
          geoError.code === geoError.POSITION_UNAVAILABLE
            ? "We could not determine your position. Please ensure location services are enabled and try again."
            : "Unable to retrieve your location. Please try again.";

        if (attemptsRef.current < autoRetryLimit) {
          setStatus("retrying");
          setErrorMessage(`${friendlyMessage} Retrying...`);
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            requestLocationRef.current();
          }, 2000);
          return;
        }

        setStatus("error");
        setErrorMessage(friendlyMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestLocationRef.current();

    return () => {
      clearPendingRetry();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const runReverseGeocoding = async () => {
      if (!coords || status !== "resolving") {
        return;
      }

      try {
        const result = await reverseGeocode(coords.latitude, coords.longitude);
        if (cancelled) {
          return;
        }

        setAddress(result);
        setStatus("success");
      } catch (error) {
        console.log(error);
        if (cancelled) {
          return;
        }

        setStatus("partial");
        setErrorMessage(
          "Coordinates detected, but we could not resolve the address."
        );
      }
    };

    runReverseGeocoding();

    return () => {
      cancelled = true;
    };
  }, [coords, status]);

  const isLoading =
    status === "locating" || status === "resolving" || status === "retrying";

  return (
    <div className="p-6 space-y-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Current location</p>
          <h2 className="text-xl font-semibold text-gray-900">
            Browser Geolocation
          </h2>
        </div>
        <button
          onClick={requestLocation}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700 disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "Detecting..." : "Detect Again"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 bg-gray-50 rounded-md border">
          <p className="mb-1 text-xs tracking-wide text-gray-500 uppercase">
            Latitude
          </p>
          <p className="font-mono text-lg text-gray-900">
            {formatCoordinate(coords?.latitude)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-md border">
          <p className="mb-1 text-xs tracking-wide text-gray-500 uppercase">
            Longitude
          </p>
          <p className="font-mono text-lg text-gray-900">
            {formatCoordinate(coords?.longitude)}
          </p>
        </div>
      </div>

      {address && (
        <div className="p-4 text-green-900 bg-green-50 rounded-md border">
          <p className="text-sm font-semibold">{address.city}</p>
          <p className="text-sm">{address.country}</p>
        </div>
      )}

      {!address && status === "locating" && (
        <p className="text-sm text-gray-500">
          Waiting for location permission...
        </p>
      )}

      {status === "denied" && (
        <p className="text-sm font-medium text-red-600">
          Location permission denied.
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">
          {errorMessage ||
            "Something went wrong while detecting your location."}
        </p>
      )}

      {status === "partial" && (
        <p className="text-sm text-yellow-700">{errorMessage}</p>
      )}
    </div>
  );
}

export default LocationDetector;
